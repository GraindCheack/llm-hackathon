#!/usr/bin/env node

import "dotenv/config"; // Load environment variables from .env
import axios from "axios";
import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";

// Check for OpenAI API key
if (!process.env.OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY in .env file");
  process.exit(1);
}

const chat = new ChatOpenAI({
  modelName: "gpt-4o",
});

/**
 * Fetches mock data from an API.
 * We're using this as an example backend to retrieve data.
 * @returns {Promise<Object>} The fetched data.
 * @throws Will throw an error if the request fails.
 */
async function fetchMockData() {
  try {
    const response = await axios.get("https://bored-api.appbrewery.com/filter?type=education");
    return response.data;
  } catch (error) {
    console.error("Error fetching mock data:", error);
    throw error;
  }
}

/**
 * Sends a prompt to the OpenAI assistant (via LangChain),
 * including some data from the backend,
 * and returns the assistant's response.
 * @param {Object} data - The data to include in the prompt.
 * @returns {Promise<string>} The assistant's response.
 */
async function getAssistantResponse(data) {
  const parser = new StringOutputParser();
  const dataJson = JSON.stringify(data, null, 2);

  const template = `
You are a helpful assistant that explains the data fetched from the backend.
Your answers are always less than 50 words.

Data: {data}`;

  const promptTemplate = ChatPromptTemplate.fromTemplate(template);
  const chain = promptTemplate.pipe(chat).pipe(parser);

  return await chain.invoke({ data: dataJson });
}

(async () => {
  try {
    console.log("Fetching data from backend...");
    const data = await fetchMockData();
    console.log("Data fetched");

    console.log("\nQuerying OpenAI assistant via LangChain...");
    const assistantResponse = await getAssistantResponse(data);
    console.log("Assistant response:\n", assistantResponse);
  } catch (error) {
    console.error("An error occurred:", error);
  }
})();
