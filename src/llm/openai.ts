import OpenAI from "openai";
import { config } from "../config.js";

// No baseURL → the SDK talks to the real OpenAI API.
const client = new OpenAI({
  apiKey: config.openaiApiKey,
});

export async function ask(systemPrompt: string, text: string): Promise<string> {
  const res = await client.chat.completions.create({
    model: "gpt-4o-mini", // cheap tier — fine for short customer-service replies
    max_tokens: 300, // cap output (cost + speed) per project convention
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: text },
    ],
  });
  return res.choices[0]?.message?.content ?? "";
}
