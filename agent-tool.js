import "dotenv/config";
import OpenAI from "openai";
import axios from "axios";
import { z } from "zod";

import {
  Agent,
  run,
  tool,
  OpenAIChatCompletionsModel
} from "@openai/agents";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

// Weather tool
// Weather tool
const getWeatherTool = tool({
  name: "get_weather",
  description: "Returns the current weather information for a city",

  parameters: z.object({
    city: z.string().describe("name of the city"),
  }),

  execute: async function ({ city }) {

    // Check if WeatherAPI key is loaded
    console.log("Weather key exists:", !!process.env.WEATHER_API_KEY);

    // WeatherAPI URL
    const url = `https://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${city}`;

    // Get weather data
    const response = await axios.get(url);

    // Return weather to the Agent
    return `The weather of ${city} is ${response.data.current.condition.text}
Temperature: ${response.data.current.temp_c}°C`;
  },
});

// Agent
const agent = new Agent({
  name: "weather agent",

  instructions:
    "You are an expert weather agent that helps users with weather information. Use the weather tool whenever the user asks about weather.",

  model: new OpenAIChatCompletionsModel(
    groq,
    "openai/gpt-oss-20b"
  ),

  tools: [getWeatherTool]
});
const sendEmail = tool({
    name:'send_email',
    description:'This tool sends a email',
    parameters:z.object({
        toEmail: z.string().describe('email address to'),
        subject: z.string().describe('subject'),
        body: z.string().describe('body of the mail'),
    }),
    execute: async function({body,subject,toEmail}){

    }
})
//tools: [getWeatherTool]

// Output
async function main(query = "") {
  const result = await run(agent, query);
  console.log("Result:", result.finalOutput);
}

main("Give me the current weather of Kolkata, Delhi, and Chandigarh. Use the weather tool for each city.");