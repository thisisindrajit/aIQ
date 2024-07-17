import Groq from "groq-sdk";
import { inngest } from "./client";
import {
  fetchHtmlContentAndVectorize,
  normalizeChunks,
  normalizeData,
  searchForSources,
} from "@/utilities/commonUtilities";

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
              content: process.env.TOPIC_GENERATION_PROMPT!,
            },
            { role: "user", content: searchQuery },
          ],
          model: "llama3-70b-8192",
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
          const formattedTopic =
            "Give me basic information about " + topic.data; // This is done to get more relevant search results

          // Get search results
          const searchResults = await searchForSources(formattedTopic);

          // Normalize search results
          const normalizedData = await normalizeData(searchResults);

          // Vectorize the content and return similar chunks
          const similarTextChunks = await Promise.all(
            normalizedData.map((item: { title: string; link: string }) =>
              fetchHtmlContentAndVectorize(searchQuery, item)
            )
          );

          if (!similarTextChunks || similarTextChunks.length === 0) {
            throw new Error();
          }

          return {
            success: true,
            message: `Successfully retrieved similar chunks of text using vectorization for the search query - ${searchQuery}`,
            data: similarTextChunks,
          };
        } catch (error) {
          return {
            success: false,
            message: `Error retrieving similar chunks of text using vectorization for the search query - ${searchQuery}`,
            data: null,
          };
        }
      }
    );

    // If some error occurred while generating similar text chunks, then create an entry in the notification table and exit
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
        const normalizedChunks = normalizeChunks(similarTextChunks);

        const chatCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: `Here is my topic - ${topic.data}. ${process.env
                .SNIPPET_GENERATION_PROMPT!}`,
            },
            {
              role: "user",
              content:
                normalizedChunks.length > 0
                  ? `Here are the top results from a similarity search - ${normalizedChunks}`
                  : "",
            },
          ],
          model: "llama3-70b-8192", // Other models - "mixtral-8x7b-32768"
          response_format: { type: "json_object" },
        });

        const generatedSnippet = chatCompletion.choices[0]?.message?.content;

        if (generatedSnippet && generatedSnippet !== "{}") {
          const createdSnippet = await prisma.snippets.create({
            data: {
              generated_by_ai: true,
              requested_by: userId,
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
              notification: `${searchQuery}|${process.env.NEXT_PUBLIC_BASE_URL}/user/snippet/${createdSnippet.xata_id}`,
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
        message: `Error while generating snippet for the search query - ${searchQuery}`,
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
