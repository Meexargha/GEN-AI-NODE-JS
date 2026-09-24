



// normal instrunction 
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function run() {
  // groq.chat.completions.create -> these line hit the groq chat api 
  const response = await groq.chat.completions.create({
    model: "openai/gpt-oss-20b",
    messages: [
      {
        role: "user",
        // role 
        content: "Hello, how are you?",
      },
    ],
  });

  console.log(response.choices[0].message.content);
}

run();