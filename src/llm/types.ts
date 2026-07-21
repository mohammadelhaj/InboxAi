export type Message = { role: "user" | "assistant"; text: string };

export interface LLMProvider {
  complete(systemPrompt: string, history: Message[]): Promise<string>;
}