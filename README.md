# Le Chat à Paris

A language-learning journal app for people living in (or dreaming of) Paris. Capture everyday moments with a photo and caption, and the app writes a short diary entry in your target language — calibrated to your CEFR level. Review past memories from a calendar, listen to them read aloud, and edit entries with AI-assisted refinement.

## Features

- **Moment capture** — photo + caption → AI-generated first-person diary entry
- **CEFR-aware writing** — output pitched to your level (A1 → C1)
- **Text-to-speech** — OpenAI TTS reads your entries aloud in the target language
- **Translation toggle** — read any entry in your native language on demand
- **Edit & refine** — edit freely; saving triggers an AI polish pass
- **Calendar review** — browse all saved memories by date

## Tech stack

Next.js (App Router) · TypeScript · Tailwind CSS · OpenAI API (GPT-4o mini + TTS)

---

## Running locally

### 1. Clone and install

```bash
git clone <repo-url>
cd le-chat-a-paris
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your values (see [Environment variables](#environment-variables) below).

### 3. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | Yes | Your OpenAI API key. Used server-side only — never exposed to the client. |
| `MOCK_GENERATE` | No | Set to `true` to bypass all OpenAI calls and return static placeholder text. Useful for local UI work without spending API credits. Leave unset in production. |

> **Security note**: `OPENAI_API_KEY` is read exclusively inside Next.js route handlers (`app/api/`). It is never referenced in any client component or sent to the browser.

---

## Deploying to Vercel

1. Push the repository to GitHub.
2. Import the project on [vercel.com](https://vercel.com).
3. In **Project Settings → Environment Variables**, add:
   - `OPENAI_API_KEY` — your production OpenAI key (mark as **Secret**)
4. Deploy. Vercel auto-detects Next.js — no build configuration needed.

Do **not** set `MOCK_GENERATE` in the Vercel environment; omitting it is enough to keep it disabled.
