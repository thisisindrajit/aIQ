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

// Functions exported from this file are exposed to Inngest
// See: @/app/api/inngest/route.ts

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Params: searchQuery (string), userId (string)
export const generateSnippet = inngest.createFunction(
  { id: "generate-snippet" }, // Each function should have a unique ID
  { event: "app/generate.snippet" }, // When an event by this name received, this function will run
  async ({ event, step, prisma }) => {
    const { searchQuery, userId }: { searchQuery: string; userId: string } =
      event.data;

    if (!searchQuery || !userId) {
      return { event, body: "Missing search query or user ID in parameters!" };
    }

    // STEP 1: Get topic based on the search query
    const topic = await step.run("get-topic-using-llm", async () => {
      if (groq) {
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: `Create a concise search query for the given topic that can be used in a search engine API to retrieve general information. The query should:
              1.Be no longer than 5-7 words
              2.Include the most relevant keywords related to the topic
              3.Avoid unnecessary words like articles (a, an, the) or prepositions
              4.Include "overview" or "introduction" if applicable to focus on general information
              5.Do not add any quotation marks
              Return only the search query string, without any additional explanation or formatting. If you don't have any information about the input, just return NO INFORMATION.`,
            },
            { role: "user", content: searchQuery },
          ],
          model: "llama3-8b-8192", // This is the best model for topic generation
        });

        const generatedTopic = chatCompletion.choices[0]?.message?.content;

        if (generatedTopic) {
          return {
            generatedByLlm: true,
            data: generatedTopic,
          };
        }
      } else {
        console.error("Groq API key is missing");
      }

      return { generatedByLlm: false, data: searchQuery };
    });

    // If no information is found by topic generator, then create an entry in the notification table and exit
    if (topic.generatedByLlm && topic.data.toLowerCase() === "no information") {
      await prisma.user_notifications.create({
        data: {
          notification: `No information found for ${searchQuery}`,
          notification_creator: process.env.AIQ_AI_USER_ID!,
          notification_receiver: userId,
          notification_type: "rec_cqabeltt6qchmfcgs030", // notification type for error
        },
      });

      return {
        event,
        body: `No information found by topic generator for the search query - ${searchQuery}`,
      };
    }

    // STEP 2: Use search API to get search results and retrieve similar chunks of text by vectorizing the normalized results
    const similarTextChunks = await step.run(
      "search-and-retrieve-similar-snippets-by-vectorization",
      async () => {
        try {
          const formattedTopic = topic.data.replaceAll("\"", ""); // Remove any quotation marks from the topic

          // Get search results
          const searchResults = await searchForSources(formattedTopic);

          // Normalize search results
          const normalizedData = await normalizeData(searchResults);

          // Vectorize the content and return all similar chunks
          const allSimilarChunks = await Promise.all(
            normalizedData.map((item: { title: string; link: string }) =>
              fetchHtmlContentAndVectorize(searchQuery, item)
            )
          );

          if (!allSimilarChunks || allSimilarChunks.length === 0) {
            throw new Error("No similar chunks found!");
          }

          return {
            success: true,
            message: `Successfully retrieved similar chunks of text using vectorization for the search query - ${searchQuery}`,
            data: allSimilarChunks,
          };
        } catch (error) {
          return {
            success: false,
            message: `Error retrieving similar chunks of text using vectorization for the search query - ${searchQuery}. Error - ${error}`,
            data: null,
          };
        }
      }
    );

    // If some error occurred while generating similar text chunks or no similar chunks are found, then create an entry in the notification table and exit
    if (similarTextChunks.success === false || !similarTextChunks.data) {
      await prisma.user_notifications.create({
        data: {
          notification: `${searchQuery}`,
          notification_creator: process.env.AIQ_AI_USER_ID!,
          notification_receiver: userId,
          notification_type: "rec_cqabeltt6qchmfcgs030", // notification type for error
        },
      });

      return {
        event,
        body:
          similarTextChunks.message ??
          `Error retrieving similar chunks of text using vectorization for the search query - ${searchQuery}`,
      };
    }

    // STEP 3: Use topic and similar chunks to generate a snippet
    const snippet = await step.run("generate-snippet-using-rag", async () => {
      if (groq) {
        const normalizedChunks =
          !similarTextChunks.data || similarTextChunks.data.length === 0
            ? ""
            : normalizeChunks(similarTextChunks);

        const chatCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: `Here is my topic - ${topic.data}. Give me a detailed summary of the topic using the 5W1H framework. For each category (What/Who, Why, When, Where, and How), provide 2 to 4 complete and gramatically correct sentences as elements in an array. Use simple language with minimal jargon to make the content easily understandable. Highlight important words using markdown format to enhance focus. Atleast 1 sentence in each category must contain highlighted words and do not highlight the topic. Additionally, include 3 amazing facts about the topic if you have the information. Present the final result in JSON format with these keys (whatorwho, why, when, where, how, amazingfacts) and their respective content as values. If you lack sufficient credible information about the topic, return only an empty object.`,
            },
            {
              role: "user",
              content:
                normalizedChunks.length > 0
                  ? `Here are the top results from a similarity search. Use them if relevant information is available or else use information that is available to you - ${normalizedChunks}`
                  : "",
            },
          ],
          model: "llama3-70b-8192", // Other models - "mixtral-8x7b-32768"
          response_format: { type: "json_object" },
        });

        const generatedSnippet = chatCompletion.choices[0]?.message?.content;

        if (generatedSnippet && generatedSnippet !== "{}") {
          const requestorDetails: User = await createdClerkClient.users.getUser(userId);
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

          return {
            success: true,
            message: `Snippet generated successfully for the search query - ${searchQuery}`,
            data: JSON.parse(generatedSnippet),
          };
        }
      } else {
        console.error("Groq API key is missing");
      }

      return {
        success: false,
        message: `Could not able to generate snippet for the search query - ${searchQuery}`,
        data: null,
      };
    });

    // If snippet is not generated successfully, then create an entry in the notification table and exit.
    if (snippet.success === false) {
      await prisma.user_notifications.create({
        data: {
          notification: `${searchQuery}`,
          notification_creator: process.env.AIQ_AI_USER_ID!,
          notification_receiver: userId,
          notification_type: "rec_cqabeltt6qchmfcgs030", // notification type for error
        },
      });

      return {
        event,
        body:
          snippet.message ??
          `Error while generating snippet for the search query - ${searchQuery}`,
      };
    }

    return { event, body: snippet };
  }
);
