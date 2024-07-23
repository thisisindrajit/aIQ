// import { MistralAIEmbeddings } from "@langchain/mistralai";
import { FireworksEmbeddings } from "@langchain/community/embeddings/fireworks";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import * as cheerio from "cheerio";
import { DocumentInterface } from "@langchain/core/documents";

// Utility function for fetching search results for a given topic from Serper API
export async function searchForSources(topic: string): Promise<string> {
  const serperApiKey = process.env.SERPER_API_KEY;
  let requestHeaders = new Headers();

  requestHeaders.append("X-API-KEY", serperApiKey || "");
  requestHeaders.append("Content-Type", "application/json");

  let raw = JSON.stringify({
    q: topic,
  });

  let requestOptions: RequestInit = {
    method: "POST",
    headers: requestHeaders,
    body: raw,
    redirect: "follow",
  };

  console.log("Using serper API to get search results for topic: ", topic);

  const searchResults = await fetch(
    `https://google.serper.dev/search`,
    requestOptions
  );

  if (!searchResults.ok) {
    throw "Error fetching search results from Serper API";
  }

  return await searchResults.text();
}

// Utility function for normalizing search results
export async function normalizeData(
  searchResults: string
): Promise<{ title: string; description: string; link: string }[]> {
  const parsedSearchResults = JSON.parse(searchResults);
  const extractedTitleDescAndLinks =
    extractTitleDescAndLinks(parsedSearchResults);

  const limit = Number(process.env.NEXT_PUBLIC_LIMIT_FOR_SEARCH_RESULTS ?? 6);
  return extractedTitleDescAndLinks.slice(0, limit);
}

function extractTitleDescAndLinks(obj: {
  [x: string]: any;
}): { title: string; description: string; link: string }[] {
  const results: { title: string; description: string; link: string }[] = [];

  function traverse(currentObj: { [x: string]: any }) {
    if (currentObj && typeof currentObj === "object") {
      if (
        "title" in currentObj &&
        "link" in currentObj &&
        !currentObj.link.includes("youtube") // Skipping youtube links for now as they won't contain any useful content on just scraping.
      ) {
        results.push({
          title: currentObj.title,
          description: currentObj.snippet ?? "No description available 😭",
          link: currentObj.link,
        });
      }

      for (const value of Object.values(currentObj)) {
        traverse(value);
      }
    }
  }

  traverse(obj);

  return results;
}

// Utility function to vectorize the content and store in memory vector database
export async function fetchHtmlContentAndVectorize(
  searchQuery: string,
  item: { title: string; description: string; link: string }
): Promise<null | DocumentInterface[]> {
  // const embeddings = new MistralAIEmbeddings({
  //   apiKey: process.env.MISTRAL_API_KEY,
  // });
  const embeddings = new FireworksEmbeddings();
  const htmlContent = await fetchPageContentFromLink(item.link);

  if (htmlContent && htmlContent.length < 100) return null; // Ignoring content with less than 100 characters

  const splitText = await new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  }).splitText(htmlContent);

  const vectorStore = await MemoryVectorStore.fromTexts(
    splitText,
    { link: item.link, title: item.title },
    embeddings
  );

  return await vectorStore.similaritySearch(searchQuery, 2);
}

// Helper function to fetch page content from a given link
async function fetchPageContentFromLink(link: string): Promise<string> {
  try {
    const userAgents = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0",
      "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)", // Facebook user agent
    ];

    for (let i = 0; i < userAgents.length; i++) {
      const responseText = await fetchDataFromUrl(link, userAgents[i]);

      if (responseText.length > 0) {
        return extractMainContent(responseText);
      }
    }

    return ""; // Return empty string if no content is fetched
  } catch (error) {
    console.error(`Error fetching page content for ${link}:`);
    return "";
  }
}

// Helper function to fetch data from a given URL
async function fetchDataFromUrl(
  url: string,
  userAgent: string
): Promise<string> {
  const headers: HeadersInit = {
    "User-agent": userAgent,
  };

  const response = await fetch(url, {
    method: "GET",
    headers: headers,
  });

  if (!response.ok) {
    return ""; // Return empty string if response is not ok
  }

  return await response.text();
}

// Helper function to extract main content from the HTML page using cheerio
function extractMainContent(html: string): string {
  const $ = html.length ? cheerio.load(html) : null;

  if (!$) return "";

  $("script, style, head, nav, footer, iframe, img").remove();

  return $("body").text().replace(/\s+/g, " ").trim();
}

// Utility function to normalize chunk data
export function normalizeChunks(
  chunksArray: (
    | {
        pageContent: string;
        metadata: Record<string, any>;
        id?: string | undefined;
      }[]
    | null
  )[]
): string {
  return chunksArray
    .map(
      (
        array?:
          | {
              metadata: Record<string, any>;
              id?: string | undefined;
              pageContent: string;
            }[]
          | null
      ) => {
        if (!array) return "";

        return array.reduce((acc, item) => {
          if (item.pageContent) {
            acc += item.pageContent;
          }
          return acc;
        }, "");
      }
    )
    .join(" | ");
}

// Utility function to separate sentences from a paragraph
export function separateSentences(paragraph: string): string[] {
  // Regular expression to match sentence endings
  const sentenceRegex = /[.!?]+(?=\s+|$)/g;

  // Split the paragraph into sentences
  const sentences = paragraph.split(sentenceRegex);

  // Trim whitespace and filter out empty sentences
  return sentences
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0)
    .map((sentence) => sentence + ".");
}

// Utility function to convert all keys of an object to lowercase
export function lowercaseKeys<T extends Record<string, any>>(
  obj: T
): { [K in Lowercase<string & keyof T>]: T[keyof T] } {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    (acc as any)[key.toLowerCase()] = value;
    return acc;
  }, {} as { [K in Lowercase<string & keyof T>]: T[keyof T] });
}

// Utility function to convert date to a pretty format in local timezone
export function convertToPrettyDateFormatInLocalTimezone(
  inputDate: Date
): string {
  const date = inputDate.getDate();
  const month = inputDate.getMonth() + 1;
  const year = inputDate.getFullYear();

  const hours =
    inputDate.getHours() > 12
      ? inputDate.getHours() - 12
      : inputDate.getHours() === 0
      ? 12
      : inputDate.getHours();

  const minutes =
    inputDate.getMinutes() < 10
      ? "0" + inputDate.getMinutes()
      : inputDate.getMinutes();
  const amOrPm = inputDate.getHours() >= 12 ? "PM" : "AM";

  let fullDate = `${date}/${month}/${year}`;

  let today = new Date();

  if (
    inputDate.toLocaleDateString() ===
    new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    ).toLocaleDateString()
  ) {
    fullDate = "Today";
  }

  return `${fullDate} at ${hours}:${minutes} ${amOrPm}`;
}
