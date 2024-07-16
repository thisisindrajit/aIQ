// import { MistralAIEmbeddings } from "@langchain/mistralai";
import { FireworksEmbeddings } from "@langchain/community/embeddings/fireworks";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import * as cheerio from "cheerio";

// Utility function for fetching search results for a given topic from Serper API
export async function searchForSources(topic: string) {
  const serperApiKey = process.env.SERPER_API_KEY;
  let requestHeaders = new Headers();

  requestHeaders.append("X-API-KEY", serperApiKey || "");
  requestHeaders.append("Content-Type", "application/json");

  let raw: string = JSON.stringify({
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

  const searchResultsText = await searchResults.text();

  return searchResultsText;
}

// Utility function for normalizing search results
export async function normalizeData(searchResults: string) {
  const parsedSearchResults = JSON.parse(searchResults);
  const extractedTitleAndLinks: { title: string; link: string }[] =
    extractTitleAndLinks(parsedSearchResults);

  return extractedTitleAndLinks
    .slice(0, 5)
    .map(({ title, link }: { title: string; link: string }) => ({
      title,
      link,
    }));
}

function extractTitleAndLinks(obj: { [x: string]: any }) {
  const results: { title: string; link: string }[] = [];

  function traverse(currentObj: { [x: string]: any }) {
    if (currentObj && typeof currentObj === "object") {
      if (
        "title" in currentObj &&
        "link" in currentObj &&
        !currentObj.link.includes("youtube") // Skipping youtube links for now as they won't contain any useful content on just scraping.
      ) {
        results.push({
          title: currentObj.title,
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
  item: { title: string; link: string }
) {
  // const embeddings = new MistralAIEmbeddings({
  //   apiKey: process.env.MISTRAL_API_KEY,
  // });
  const embeddings = new FireworksEmbeddings();
  const htmlContent = await fetchPageContent(item.link);

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

// Utility function to fetch page content from the given link
async function fetchPageContent(link: string) {
  try {
    const userAgents = [
      "aiq.fyi Bot",
      "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)", // Facebook user agent
    ];

    for (let i = 0; i < userAgents.length; i++) {
      const responseText = await fetchDataFromUrl(link, userAgents[i]);

      if(responseText.length > 0){
        return extractMainContent(responseText);
      }
    }

    return ""; // Return empty string if no content is fetched
  } catch (error) {
    console.error(`Error fetching page content for ${link}:`);
    return "";
  }
}

async function fetchDataFromUrl(url: string, userAgent: string) {
  const headers: HeadersInit = {
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    Connection: "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-User": "?1",
    "Sec-Fetch-Dest": "document",
    "Cache-Control": "max-age=0",
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

// Utility function to extract main content from the HTML page using cheerio
function extractMainContent(html: string) {
  const $ = html.length ? cheerio.load(html) : null;

  if (!$) return "";

  $("script, style, head, nav, footer, iframe, img").remove();

  return $("body").text().replace(/\s+/g, " ").trim();
}

// Utility function to normalize chunk data
export function normalizeChunks(obj: { [x: string]: any }) {
  return obj.data
    .map(
      (
        array?:
          | {
              metadata: { title: string; link: string };
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

export function separateSentences(paragraph: string): string[] {
  // Regular expression to match sentence endings
  const sentenceRegex = /[.!?]+(?=\s+|$)/g;
  
  // Split the paragraph into sentences
  const sentences = paragraph.split(sentenceRegex);
  
  // Trim whitespace and filter out empty sentences
  return sentences
    .map(sentence => sentence.trim())
    .filter(sentence => sentence.length > 0)
    .map(sentence => sentence + ".");
}

