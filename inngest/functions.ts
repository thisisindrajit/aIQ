import Groq from "groq-sdk";
import { inngest } from "./client";

// Functions exported from this file are exposed to Inngest
// See: @/app/api/inngest/route.ts

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Params: searchQuery (string)
export const generateSnippet = inngest.createFunction(
  { id: "generate-snippet" }, // Each function should have a unique ID
  { event: "app/generate.snippet" }, // When an event by this name received, this function will run

  async ({ event, step, prisma }) => {
    // STEP 1: Get topic based on the search query
    const topic = await step.run("get-topic", async () => {
      if (groq) {
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content:
                "You are a topic finder and based on the given input, you provide the search term for the input that will be used in a search engine API. In case the input itself can be a search term, ONLY RETURN THE INPUT. Else ONLY RETURN THE GENERATED SEARCH TERM. If the input is not understandable or there is no information regarding the input, ONLY RETURN NO INFORMATION.",
            },
            { role: "user", content: event.data.searchQuery },
          ],
          model: "llama3-70b-8192",
        });

        // Print the completion returned by the LLM. In case of an error, return the search query itself
        return (
          chatCompletion.choices[0]?.message?.content ?? event.data.searchQuery
        );
      }

      return event.data.searchQuery;
    });

    // STEP 2: Use brave search API to get the search results and store them in memory vector database

    // STEP 3: Use the search results to generate a snippet

    return { event, body: topic };
  }
);
