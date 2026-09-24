import "dotenv/config";

import OpenAI from "openai";
import {Agent,run,OpenAIChatCompletionsModel,} from "@openai/agents";

// Groq
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});
// this the location the location choose 
const location = "india";
// 
const helloAgent = new Agent({
  name: "Hello Agent",

  instructions: function () {
    if (location === "india") {
      return "Always say namaste and then say hello world with user's name";
    } else {
      return "Just talk to the user";
    }
  },

  model: new OpenAIChatCompletionsModel(
    groq,
    "openai/gpt-oss-20b"
  ),
});

run(helloAgent, "Hey There, My name is Piyush Garg").then((result) => {
  console.log(result.finalOutput);
});