# CLAUDE.md — Inbox AI

## How I want you to work (read this first)

I am learning as I build. **Do not write the whole app or whole features at once.**

- Work in **small, reviewable steps** — usually one file or one function at a time.
- **Before writing code, briefly explain** what you're about to do and why, in plain terms.
- After each step, **stop and let me review** before continuing. Don't chain many steps in one go.
- When you make a design choice, **say why this way and not another** — that's where I learn.
- If I ask "why", give the reasoning, not just the fix.
- Prefer teaching me the pattern over doing it for me silently.
- Keep changes scoped to what I asked. Don't refactor unrelated files or "improve" things I didn't mention.

If a task is big, propose a numbered plan first and let me approve it before touching code.

## What Inbox AI is

A **multi-tenant** SaaS: one WhatsApp AI assistant platform serving many small businesses (MENA region, Arabic + English). One codebase, one server, one database serve all businesses. Each business ("tenant") has its own prompt, data, and conversations — and must **never** see another tenant's data.

Think "bot factory," not "a bot."

## Stack

- Node 22, **TypeScript**, **Express 5**
- **ESM** — relative imports MUST end in `.js` even though files are `.ts` (e.g. `import { x } from "./core.js"`)
- `pino` for logging
- **Zod** for request validation
- **Prisma + PostgreSQL** (coming — not built yet)
- **BullMQ + Redis** for the job queue (coming — not built yet)
- Runtime LLM: **Claude** (initial, using existing credits — cheap tier only), swappable to **OpenAI** or **Gemini** via the same interface. OpenAI/Gemini use an OpenAI-compatible client.

## Non-negotiable rules

1. **Multi-tenancy is a business rule, not a feature.** Every tenant-scoped function takes `tenantId` as its **first argument**. Never query or return data without scoping by tenant. A missing tenant filter is a data-breach bug, treat it as critical.

2. **Providers go behind interfaces, chosen via config/env.** The LLM provider and the WhatsApp provider are both swappable. Never hardcode a specific provider (OpenAI, Gemini, Meta) inside business logic. Business logic depends on an interface; the concrete provider is selected from an env var.

3. **Claude is an allowed runtime LLM for now — behind the same interface as everything else.** I have Claude API credits, so the running bot may use Claude as its LLM provider initially. I plan to swap to OpenAI or Gemini later, so Claude must sit behind the `LLMProvider` interface like any other provider — NEVER hardcoded into business logic. The swap must be a one-line env change, not a refactor.
   - **Cost caution:** for the bot's short customer-service replies, use a **cheap** Claude model (e.g. Haiku tier), NOT the expensive Fable/Opus tiers. Reserve the pricey models for development help, not runtime traffic. Always cap `max_tokens`.
   - Keep OpenAI and Gemini implementations of the interface ready so switching providers is trivial.

4. **Config crashes on boot if misconfigured.** Required env vars are validated at startup via a `required()` helper; the app refuses to start if one is missing. Never read `process.env` directly in business code — read from the validated `config` object.

5. **Errors go through `AppError` + the central error handler.** Routes never leak stack traces or return HTML. All error responses are consistent JSON: `{ error: { code, message, requestId } }`.

6. **`app.ts` builds the app; `index.ts` starts it.** Keep them separate so the app can be imported in tests without opening a port.

7. **Repository/service pattern for data.** Routes never touch the data store directly. They call service functions that take `tenantId` first. This is what makes "swap in-memory store for Postgres later" a one-file change.

## What already exists (don't rebuild)

- `src/config.ts` — env validation with `required()`
- `src/logger.ts` — pino instance
- `src/errors.ts` — `AppError`, `NotFoundError`, `ValidationError`
- `src/middleware/` — `requestId`, `requestLogger`, `errorHandler`
- `src/app.ts` — Express app assembly (middleware order matters: json → requestId → requestLogger → routes → 404 → errorHandler LAST)
- `src/index.ts` — server bootstrap + graceful shutdown
- `src/routes/health.ts` — `GET /health`
- A working LLM call: `ask(systemPrompt, text)` in `src/llm/` (currently single-provider — refactoring to an interface is an upcoming task)
- `src/tenants.ts` — hardcoded tenant configs with `systemPrompt` (temporary; moves to Postgres later)

## Roadmap (rough order — we do these one at a time, and I approve each)

1. LLM provider **interface** (`LLMProvider`) with **Claude, OpenAI, and Gemini** implementations, selected via `LLM_PROVIDER` / `LLM_MODEL` env vars. Claude is the initial active provider (cheap tier). Keep current `ask` behavior.
2. WhatsApp provider **interface** + a **simulator** implementation (fake incoming/outgoing) so the full loop works with no real number. Meta implementation stubbed for later.
3. Postgres + Prisma — replace the in-memory/hardcoded stores. Every table has `tenantId`.
4. The conversation loop as a service: `handleIncoming(tenantId, from, text)` → store → LLM → store → send.
5. Zod validation on all incoming requests.
6. BullMQ + Redis queue so concurrent messages don't block.
7. Auth (JWT + argon2) so each business logs in and sees only its data.
8. Docker + Docker Compose (Postgres + Redis + API).
9. Later: retrieval (per-tenant knowledge), function-calling (calendar booking, client lookup), analytics dashboard, billing/usage limits.

## Conventions

- Import extensions: `.js` on relative imports (ESM rule).
- Async errors in routes: pass to `next(err)` so the error handler catches them.
- Cap LLM `max_tokens` on every call (cost + speed).
- Put the (stable) system prompt first in the messages array so prompt caching can apply.
- Commit before starting a new task so each change is a clean, reviewable diff.