import "dotenv/config";
import OpenAI from "openai";
import { Agent, tool, run, OpenAIChatCompletionsModel } from "@openai/agents";
import { RECOMMENDED_PROMPT_PREFIX } from "@openai/agents-core/extensions";
import { z } from "zod";
import fs from "node:fs/promises";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const refundTool = tool({
  name: "process_refund",
  description: "Process customer refund",
  parameters: z.object({
    customerId: z.string(),
    reason: z.string(),
  }),
  execute: async ({ customerId, reason }) => {
    await fs.appendFile("./refunds.txt", `Refund: ${customerId} - ${reason}\n`);
    return "Refund processed successfully";
  },
});

const refundAgent = new Agent({
  name: "Refund Agent",
  instructions: "Handle customer refund requests using the refund tool.",
  model: new OpenAIChatCompletionsModel(groq, "openai/gpt-oss-20b"),
  tools: [refundTool],
});

const plansTool = tool({
  name: "fetch_plans",
  description: "Get available internet plans",
  parameters: z.object({ request: z.string().optional() }),
  execute: async () => [
    { id: 1, price: 399, speed: "30 Mbps" },
    { id: 2, price: 999, speed: "100 Mbps" },
    { id: 3, price: 1499, speed: "200 Mbps" },
  ],
});

const salesAgent = new Agent({
  name: "Sales Agent",
  instructions: "Handle internet plan and pricing questions.",
  model: new OpenAIChatCompletionsModel(groq, "openai/gpt-oss-20b"),
  tools: [plansTool],
});

const receptionAgent = new Agent({
  name: "Reception Agent",
  instructions: `${RECOMMENDED_PROMPT_PREFIX}
Route customers to the correct specialist.`,
  model: new OpenAIChatCompletionsModel(groq, "openai/gpt-oss-20b"),
  handoffs: [salesAgent, refundAgent],
});

async function main(query) {
  const result = await run(receptionAgent, query);
  console.log(result.finalOutput);
}

main("Hi, I am cust_234 and want a refund because my internet is slow.");
