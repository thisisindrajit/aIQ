import Groq from "groq-sdk";
import { inngest } from "./client";
import {
  fetchHtmlContentAndVectorize,
  normalizeChunks,
  normalizeData,
  searchForSources,
} from "@/utilities/commonUtilities";
import createdClerkClient from "@/clerk/client";
import { User } from "@clerk/nextjs/server";
import { NonRetriableError } from "inngest";

// Functions exported from this file are exposed to Inngest
// See: @/app/api/inngest/route.ts

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Params: searchQuery (string), userId (string)
export const generateSnippet = inngest.createFunction(
  {
    id: "generate-snippet", // Each function should have a unique ID
    retries: 2, // Number of retries
    onFailure: async ({ event, error, prisma }) => {
      console.error(
        "Inngest function failed after exhausting all retries - ",
        error.message
      );

      await prisma.user_notifications.create({
        data: {
          notification: event.data.event.data.searchQuery,
          notification_creator: process.env.AIQ_AI_USER_ID!,
          notification_receiver: event.data.event.data.userId,
          notification_type: "rec_cqabeltt6qchmfcgs030", // notification type for error
        },
      });
    },
  },
  { event: "app/generate.snippet" }, // When an event by this name received, this function will run
  async ({ event, step, prisma }) => {
    const {
      searchQuery,
      userId,
    }: { searchQuery: string; userId?: string | null } = event.data;

    if (!searchQuery || !userId) {
      throw new NonRetriableError(
        "Missing search query or user ID in parameters!"
      );
    }

    // STEP 1: Get topic based on the search query
    const topic = await step.run("get-topic-using-llm", async () => {
      if (groq) {
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: `Create a concise search query for the given input that can be used in a search engine API to retrieve general information about the input. The query should:
              1.Be no longer than 5-7 words
              2.Include the most relevant keywords related to the topic
              3.Include "overview" or "introduction" if applicable to focus on general information
              4.Do not add any quotation marks
              Return only the search query string, without any additional explanation or formatting. If you don't have any information about the input, just return NO INFORMATION.`,
            },
            { role: "user", content: searchQuery },
          ],
          model: "llama3-8b-8192", // This is the best model for topic generation
        });

        const generatedTopic = chatCompletion.choices[0]?.message?.content;

        if (generatedTopic) {
          return { generatedByLlm: true, data: generatedTopic };
        }
      } else {
        console.error("Groq API key is missing");
      }

      return { generatedByLlm: false, data: searchQuery };
    });

    // If no information is found by topic generator, then create an entry in the notifications table
    if (topic.generatedByLlm && topic.data.toLowerCase() === "no information") {
      await prisma.user_notifications.create({
        data: {
          notification: searchQuery,
          notification_creator: process.env.AIQ_AI_USER_ID!,
          notification_receiver: userId,
          notification_type: "rec_cqf7j33g3ip836agi0d0", // notification type for no information
        },
      });

      return {
        event,
        body: `No information found for the search query - ${searchQuery}`,
      };
    }

    // STEP 2: Use search API to get search results and retrieve similar chunks of text by vectorizing the normalized results
    const similarTextChunksAndReferences = await step.run(
      "search-and-retrieve-similar-snippets-by-vectorization",
      async () => {
        const formattedTopic = topic.data.replaceAll('"', ""); // Remove any quotation marks from the topic

        // Get search results
        const searchResults = await searchForSources(formattedTopic);

        // Normalize search results
        const normalizedData = await normalizeData(searchResults);

        // Vectorize the content and return all similar chunks
        const allSimilarChunks = await Promise.all(
          normalizedData.map((item: { title: string; description: string; link: string }) =>
            fetchHtmlContentAndVectorize(searchQuery, item)
          )
        );

        if (!allSimilarChunks || allSimilarChunks.length === 0) {
          throw new Error("No similar chunks found!");
        }

        return {
          success: true,
          data: {
            similarTextChunks: allSimilarChunks,
            references: { references: normalizedData },
          },
        };
      }
    );

    // STEP 3: Use topic and similar chunks to generate a snippet
    const snippet = await step.run("generate-snippet-using-rag", async () => {
      if (groq) {
        const normalizedChunks =
          !similarTextChunksAndReferences.data.similarTextChunks || similarTextChunksAndReferences.data.similarTextChunks.length === 0
            ? ""
            : normalizeChunks(similarTextChunksAndReferences.data.similarTextChunks);

        const chatCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: `Here is my topic - ${searchQuery}. Generate a broad, general summary of the given topic using the 5W1H framework. Use the provided context as background information, but focus on creating a summary that applies to the topic in general rather than specific instances or examples from the context. For each category (What/Who, Why, When, Where, and How), provide 2 to 4 full-fledged and grammatically correct sentences as elements in an array. Use simple, concise language with minimal jargon to make it easily understandable. In each category:
              1.Highlight 2-4 important words or phrases using markdown bold format.
              2.Ensure at least one sentence in each category contains highlighted words.
              3.Do not highlight the main topic itself.
              4.Choose highlights that are key concepts, important terms, or significant details related to the sentence and main topic.
              5.Prioritize highlighting words that are separate words or phrases, rather than parts of a larger word or phrase.
              6.Ensure the information is accurate and relevant to the main topic, avoiding any speculative or unsupported details.
              Present the final result in JSON format with these keys: whatorwho, why, when, where, how, and amazingfacts. Include 3 general amazing facts about the main topic in the amazingfacts array if such information is available. Focus on providing a broad, generally applicable summary of the main topic, avoiding overly specific details or examples from the provided context. The goal is to create a summary that would be informative and relevant even without the specific context provided. If you lack sufficient credible information about the topic, return only an empty object.`,
            },
            {
              role: "user",
              content:
                normalizedChunks.length > 0
                  ? `Here are the top results for the given input from a similarity search. Use them if relevant information is available or else use information that is available to you. Some sentences might be incomplete and do not use them directly but rephrase as required - ${normalizedChunks}`
                  : "",
            },
          ],
          model: "llama-3.1-70b-versatile", // Other models - "llama-3.1-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"
          response_format: { type: "json_object" },
        });

        const generatedSnippet = chatCompletion.choices[0]?.message?.content;

        if (generatedSnippet && generatedSnippet !== "{}") {
          const requestorDetails: User = await createdClerkClient.users.getUser(
            userId
          );

          const createdSnippet = await prisma.snippets.create({
            data: {
              generated_by_ai: true,
              requested_by: userId,
              requestor_name: requestorDetails.fullName ?? null,
              snippet_title: searchQuery,
            },
          });

          await prisma.snippet_type_and_data_mapping.create({
            data: {
              snippet_id: createdSnippet.xata_id,
              type: "rec_cqafk3325jvdoj83gfcg", // For now, only generating 5W1H type snippets
              data: JSON.parse(generatedSnippet),
              references: similarTextChunksAndReferences.data?.references ?? null,
            },
          });

          await prisma.user_notifications.create({
            data: {
              notification: `${searchQuery}|user/snippet/${createdSnippet.xata_id}`,
              notification_creator: process.env.AIQ_AI_USER_ID!,
              notification_receiver: userId,
              notification_type: "rec_cqabeqdt6qchmfcgs03g", // notification type for generated snippet
            },
          });

          return { success: true, data: JSON.parse(generatedSnippet) };
        }
      } else {
        console.error("Groq API key is missing");
      }

      throw new Error(
        `Could not able to generate snippet for the search query - ${searchQuery}`
      );
    });

    return { event, body: snippet };
  }
);
