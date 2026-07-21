import { addMessage, getMessages } from "../store.js";
import { TENANTS } from "../tenants.js";
import type { LLMProvider } from "../llm/types.js";
import { NotFoundError } from "../errors.js";

export async function handleIncoming(
  tenantId: string,
  from: string,
  text: string,
  llm: LLMProvider
): Promise<string> {
  const tenant = TENANTS[tenantId as keyof typeof TENANTS];
  if (!tenant) throw new NotFoundError(`Unknown tenant: ${tenantId}`);

  addMessage(tenantId, from, { role: "user", text });

  const history = getMessages(tenantId, from);
  const reply = await llm.complete(tenant.systemPrompt, history);

  addMessage(tenantId, from, { role: "assistant", text: reply });

  return reply;
}