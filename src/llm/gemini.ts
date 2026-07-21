import OpenAI from "openai";
import { config } from "../config.js";

const client = new OpenAI({
  apiKey: config.geminiApiKey,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

export async function ask(systemPrompt: string, text: string): Promise<string> {
  const res = await client.chat.completions.create({
    model: "gemini-flash-latest",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: text },
    ],
  });
  return res.choices[0]?.message?.content ?? "";
}