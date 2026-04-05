# SafeSpace

**SafeSpace** is a supportive web application built around **Buddy**, an AI companion that listens with empathy and helps people—especially those affected by difficult incidents—share what happened in a structured, gentle way. The app combines a React frontend, a Hono API backend, and Claude (Anthropic) for conversations, session analysis, and safety-aware responses.

> **Important:** SafeSpace is a technology demonstration and support tool. It is **not** a substitute for licensed legal, medical, or mental health professionals, emergency services, or crisis hotlines. If you or someone else is in immediate danger, contact local emergency services.

---

## Features

- **Conversational support (“Buddy”)** — Streaming chat powered by Anthropic Claude, with system prompts tuned for compassionate, trauma-informed dialogue and clear information gathering.
- **Age-aware modes** — Separate conversation styles for young children (under 7), teens (8–18), and adults (18+), including a gentle “Buddy the Bear” style for the youngest users.
- **Crisis awareness** — Pattern-based crisis detection on the server with corresponding UI alerts and prompt adjustments (not a clinical risk assessment).
- **Emotional memory** — Optional context from past emotional patterns to make follow-up conversations more coherent for signed-in users.
- **Session analysis & reports** — AI-generated summaries, identified themes, wellbeing-style scores, and recommendations; reports can be saved and viewed later (stored encrypted at rest).
- **Accounts** — Email OTP sign-in via [Better Auth](https://www.better-auth.com/) and Prisma (SQLite by default).
- **Voice** — Text-to-speech and speech input hooks in the web UI for accessibility and ease of use.
- **Security-minded API** — Security headers, CORS allowlists for known dev/preview hosts, and per-route rate limits on sensitive endpoints.

---

## Repository layout

| Path | Description |
|------|-------------|
| `webapp/` | React 18 + Vite + TypeScript SPA (Tailwind CSS, shadcn/ui, React Router, TanStack Query) |
| `backend/` | Bun + Hono API, Prisma, Better Auth, Anthropic SDK |
| `backend/prisma/` | Prisma schema (SQLite); users, sessions, chat, saved reports, emotional memories |
| `backend/src/types.ts` | Shared Zod schemas for API request/response contracts |
| `CLAUDE.md` | Workspace conventions for this monorepo-style project |

---

## Tech stack

**Frontend:** React 18, Vite 5, TypeScript, Tailwind CSS, Radix/shadcn/ui, Framer Motion, React Router v6, TanStack Query, Better Auth client.

**Backend:** Bun, Hono 4, Zod, Prisma 6 (SQLite), Better Auth (email OTP + Prisma adapter), Anthropic SDK, optional Vibecode proxy/SDK integration for hosted previews.

---

## Prerequisites

- [Bun](https://bun.sh/) (runtime and package manager for both apps)
- An [Anthropic](https://www.anthropic.com/) API key for chat and analysis features

---

## Environment variables

Create **`backend/.env`** (never commit real secrets; this repo ignores `.env` and `.env.production`):

| Variable | Required | Description |
|----------|----------|-------------|
| `BETTER_AUTH_SECRET` | Yes | Secret for Better Auth session signing |
| `DATABASE_URL` | Optional | Prisma connection string (default: `file:./dev.db` relative to backend) |
| `BACKEND_URL` | Optional | Public base URL of the API (default: `http://localhost:3000`) |
| `ANTHROPIC_API_KEY` | Yes for AI features | Anthropic API key for Claude |

For **local development** with the web app on a different origin than the API, create **`webapp/.env`** (or `.env.local`) as needed:

| Variable | Description |
|----------|-------------|
| `VITE_BACKEND_URL` | Base URL of the backend (e.g. `http://localhost:3000`). Omit or leave empty in production when the app and API share the same origin and use relative `/api/...` paths. |

---

## Local development

**1. Backend**

```bash
cd backend
bun install
# Configure backend/.env (see table above)
bunx prisma generate
bunx prisma migrate dev   # if you use migrations; otherwise ensure DB exists
bun run dev               # default: http://localhost:3000
```

**2. Web app**

```bash
cd webapp
bun install
bun run dev               # default: http://localhost:8000 (see vite.config.ts)
```

Open the web app URL in the browser. Point `VITE_BACKEND_URL` at the backend when running on separate ports.

**Useful scripts**

- Backend: `bun run dev`, `bun run start`, `bun run typecheck`
- Webapp: `bun run dev`, `bun run build`, `bun run preview`

---

## API overview

All JSON APIs are under **`/api`** unless otherwise noted.

| Area | Routes (prefix) | Notes |
|------|-------------------|--------|
| Auth | `/api/auth/*` | Better Auth handler (sessions, email OTP, etc.) |
| Chat | `/api/chat` | Streaming chat; requires `ANTHROPIC_API_KEY` |
| Analyze | `/api/analyze` | Structured session analysis JSON |
| Messages | `/api/messages` | Persisted chat messages for the logged-in user |
| Reports | `/api/reports` | List, fetch, and save encrypted analysis reports |
| Emotions | `/api/emotions` | Emotional memory endpoints |
| Health | `/health` | Simple `{ "status": "ok" }` check |

Rate limits (see `backend/src/index.ts`) apply to chat, analyze, and auth routes.

---

## Privacy & security

- Environment files with secrets must stay **out of Git** (see `.gitignore` in `backend/` and `webapp/`).
- Saved report payloads are **encrypted** before storage; use a strong `BETTER_AUTH_SECRET` and protect your database files in production.
- Review and adjust CORS `allowed` origins in `backend/src/index.ts` for your own deployment domains.

---

## License

Add a `LICENSE` file if you want to specify terms; this README does not impose one by default.

---

**SafeSpace** — a calmer place to talk things through, with Buddy by your side.
