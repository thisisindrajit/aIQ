import Groq from "groq-sdk";
import { inngest } from "./client";
// import OpenAI from "openai";

// const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Functions exported from this file are exposed to Inngest
// See: @/app/api/inngest/route.ts

// export const messageSent = inngest.createFunction(
//   { id: "message-sent" }, // Each function should have a unique ID
//   { event: "app/message.sent" }, // When an event by this name received, this function will run

//   async ({ event, step, prisma }) => {
//     // Fetch data from the database
//     const message = await prisma.messages.findUnique({
//       where: {
//         xata_id: event.data.messageId,
//       },
//     });

//     if (!message) {
//       return;
//     }

//     // You can execute code that interacts with external services
//     // All code is retried automatically on failure
//     // Read more about Inngest steps: https://www.inngest.com/docs/learn/inngest-steps
//     const reply = await step.run("create-reply", async () => {
//       // if (OPENAI_API_KEY) {
//       //   const openai = new OpenAI();
//       //   const completion = await openai.chat.completions.create({
//       //     messages: [
//       //       {
//       //         role: "system",
//       //         content:
//       //           "You are a helpful assistant. Create a funny reply to my message:",
//       //       },
//       //       { role: "user", content: message?.text },
//       //     ],
//       //     model: "gpt-3.5-turbo",
//       //   });
//       //   return (
//       //     completion.choices[0]?.message.content ?? "Unexpected OpenAI response"
//       //   );
//       // } else {
//       //   return "Add OPENAI_API_KEY environment variable to get AI responses.";
//       // }
//       if (groq) {
//         const chatCompletion = await groq.chat.completions.create({
//           messages: [
//             {
//               role: "system",
//               content:
//                 "You are a helpful assistant. Create a funny reply to my message:",
//             },
//             { role: "user", content: message?.text },
//           ],
//           model: "llama3-8b-8192",
//         });

//         // Print the completion returned by the LLM.
//         return (
//           chatCompletion.choices[0]?.message?.content ??
//           "Unexpected Groq response"
//         );
//       } else {
//         return "Groq is not available.";
//       }
//     });

//     const newMessage = await step.run("add-reply-to-message", async () => {
//       return await prisma.messages.create({
//         data: { text: reply, author: "AI" },
//       });
//     });

//     return { event, body: `Here's your last message: ${newMessage?.text}!` };
//   }
// );

export const testFunction = inngest.createFunction(
  { id: "test-function" }, // Each function should have a unique ID
  { event: "app/test.function" }, // When an event by this name received, this function will run

  async ({ event, step, prisma }) => {
    return { event, body: `This is a test message!` };
  }
);