import Groq from "groq-sdk";
import { inngest } from "./client";

// Functions exported from this file are exposed to Inngest
// See: @/app/api/inngest/route.ts

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Params: searchQuery (string)
export const generateContent = inngest.createFunction(
  { id: "generate-content" }, // Each function should have a unique ID
  { event: "app/generate.content" }, // When an event by this name received, this function will run

  async ({ event, step, prisma }) => {
    const reply = await step.run("generate-content", async () => {
      // 1. Call the Groq API to generate the correct topic for the search query
      if (groq) {
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content:
                "You are a topic finder and based on the given input, you provide the search term for the input that will be used in a search engine API. In case the input itself can be a search term, ONLY RETURN THE INPUT and nothing else. Else ONLY RETURN THE GENERATED SEARCH TERM and nothing else. If the input is not understandable or there is no information regarding the input, ONLY RETURN NO INFORMATION and nothing else.",
            },
            { role: "user", content: event.data.searchQuery },
          ],
          model: "llama3-70b-8192",
        });

        // Print the completion returned by the LLM.
        return (
          chatCompletion.choices[0]?.message?.content ??
          "Unexpected Groq response"
        );
      } else {
        return "Groq is not available.";
      }
    });

    return { event, body: reply };
  }
);
