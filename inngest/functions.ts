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
    const { searchQuery, userId } = event.data;

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

        if (chatCompletion.choices[0]?.message?.content) {
          return {
            generatedByLlm: true,
            data: chatCompletion.choices[0]?.message?.content,
          };
        }
      }

      return { generatedByLlm: false, data: searchQuery };
    });

    if (
      topic.data.generatedByLlm &&
      topic.data.toLowerCase() === "no information"
    ) {
      // TODO: Create an entry in the notification table for the user
      return { event, body: "No information found for the search query" };
    }

    // STEP 2: Use search API to get search results and retrieve similar chunks of text by vectorizing the normalized results
    const similarTextChunks = await step.run(
      "search-and-retrieve-similar-snippets-by-vectorization",
      async () => {
        try {
          const formattedTopic = "Give me basic information about " + topic.data; // This is done to get more relevant search results

          // Get search results
          const searchResults = await searchForSources(formattedTopic);

          // Normalize search results
          const normalizedData = await normalizeData(searchResults);

          // Process and vectorize the content
          return {
            success: true,
            message:
              "Successfully retrieved similar chunks of text using vectorization",
            data: await Promise.all(
              normalizedData.map((item: { title: string; link: string }) =>
                fetchHtmlContentAndVectorize(searchQuery, item)
              )
            ),
          };
        } catch (error) {
          return {
            success: false,
            message:
              "Error retrieving similar chunks of text using vectorization",
            data: null,
          };
        }
      }
    );

    if (similarTextChunks.success === false || !similarTextChunks.data) {
      // TODO: Create an entry in the notification table for the user
      return {
        event,
        body:
          similarTextChunks.message ??
          "Error retrieving similar chunks of text using vectorization",
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
          model: "llama3-70b-8192", // "mixtral-8x7b-32768"
          response_format: { type: "json_object" },
        });

        if (chatCompletion.choices[0]?.message?.content) {
          return {
            success: true,
            data: JSON.parse(chatCompletion.choices[0]?.message?.content),
          };
        }
      }

      return {
        success: false,
        data: null,
        message: "Error while generating snippet",
      };
    });

    return { event, body: snippet };
  }
);
