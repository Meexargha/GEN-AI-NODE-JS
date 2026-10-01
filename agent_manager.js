import "dotenv/config";
import { Agent, tool, run, OpenAIChatCompletionsModel } from "@openai/agents";
import OpenAI from "openai";
import {z} from 'zod';


const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const fetchplans = tool({
  name: "fetch_plans",
  description: `fetch the plan that are there `,
  parameters: z.object({
    //for grouq we cant have empty schema 
    request: z.string().optional().describe("Optional request for the plans"),
  }),
  execute: async function () {
    return [
      {
        plan_id: "1",
        price_inr: 399,
        speed: "30 Mbps",
      },
      {
        plan_id: "2",
        price_inr: 999,
        speed: "100 Mbps",
      },
      {
        plan_id: "3",
        price_inr: 1499,
        speed: "200 Mbps",
      },
    ];
  },
});

const processRefund = tool({
  name: "process_refund",

  description: "Processes a refund for a customer",

  parameters: z.object({
    customerId: z.string().describe("ID of the customer"),

    reason: z.string().describe("Reason for the refund"),
  }),

  execute: async function ({ customerId, reason }) {
    await fs.appendFile(
      "./refunds.txt",
      `Refund for Customer ${customerId}. Reason: ${reason}\n`,
      "utf-8",
    );

    return {
      refundIssued: true,
      message: `Refund processed for customer ${customerId}`,
    };
  },
});

// ----------------------------------
// REFUND AGENT
// ----------------------------------

const refundAgent = new Agent({
  name: "Refund Agent",

  instructions: `
    You are an expert refund agent.

    Help customers with refund requests.

    You must use the process_refund tool
    when the customer provides the required information.

    Required information:
    - Customer ID
    - Reason for refund

    Keep your response short and professional.
  `,

  tools: [processRefund],
});




const salesAgent = new Agent({
  name: "salesAgent",
  instructions: `   You are an expert sales agent for an internet broadband comapny.
        Talk to the user and help them with what they need.`,

  model: new OpenAIChatCompletionsModel(groq, "openai/gpt-oss-20b"),

  tools: [
    fetchplans,
    refundAgent.asTool({
      toolName: "refund_expert",

      toolDescription: "Handles customer refund questions and refund requests.",
    }),
  ],
});



async function runAgent(query='') {
    const result = await run(salesAgent,query);
    console.log(result.finalOutput);
    
}


runAgent(`hey there i want a refund plan is 399  i am shifting  `)