import Groq from "groq-sdk";
import dotenv from "dotenv";
import promptSync from "prompt-sync";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const context = [
  {
    role: "system",
    content: "You are a helpful AI assistant.",
  },
];

const prompt = promptSync({
  sigint: true,
});

async function chatCompletion() {
  const response = await groq.chat.completions.create({
    messages: context,
    model: "openai/gpt-oss-20b",
  });

  const responseMessage = response.choices[0].message;

  context.push({
    role: "assistant",
    content: responseMessage.content,
  });

  console.log(`Assistant: ${responseMessage.content}\n`);
}

async function run() {
  console.log("AI Chat Started");
  console.log("Type 'exit' to quit.\n");

  while (true) {
    const userInput = prompt("You: ");

    if (userInput.toLowerCase() === "exit") {
      console.log("Exiting chat...");
      break;
    }

    if (!userInput.trim()) {
      continue;
    }

    context.push({
      role: "user",
      content: userInput,
    });

    await chatCompletion();
  }
}

run();
