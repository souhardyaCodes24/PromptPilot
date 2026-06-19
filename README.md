# PromptPilot

**Prompt Engineering Workspace** — Turn rough ideas into production-ready prompts.

PromptPilot is a full-stack application that analyzes, structures, and refines user prompts through an intelligent interview process powered by the Groq AI API. It combines a React + TypeScript frontend with an Express + Zod backend to deliver a premium prompt engineering experience.

---

## Features

- **Prompt Analysis** — Submit a rough idea and receive a score, missing-information breakdown, and a structured prompt blueprint with role, objective, context, requirements, constraints, and expected output.
- **Guided Interview** — Answer AI-generated clarifying questions to progressively enrich your prompt, with a live preview showing how each answer shapes the final result.
- **Structured Blueprint** — Every prompt is transformed into a professional specification with clearly separated sections, ready for any LLM platform.
- **Improvement Report** — See exactly what was added, what the original strengths were, and what weaknesses were addressed.
- **Local History** — Every session is saved automatically to your browser's localStorage. Browse, search, and restore past work with no account or backend required.
- **AI Platform Export** — One-click launch buttons for ChatGPT, Gemini, Grok, Perplexity, and Claude.
- **Dark/Light Theme** — Persisted theme toggle with system-aware defaults.
- **Scroll Storyboard** — A narrative landing page that guides users through the product's value proposition before they ever click a button.

---

## Architecture

```
┌────────────────────────────────────────────────┐
│              Frontend (React 19)               │
│  Vite · TypeScript 6 · Tailwind 4             │
│  Framer Motion · react-hot-toast              │
│                                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐│
│  │ Prompt   │  │Interview │  │  Analysis    ││
│  │ Input    │→ │  Flow    │→ │  Result      ││
│  └──────────┘  └──────────┘  └──────────────┘│
│       │                           │           │
│       └──────────┬────────────────┘           │
│                  ▼                             │
│         ┌────────────────┐                    │
│         │   api.ts       │                    │
│         │  (HTTP client) │                    │
│         └───────┬────────┘                    │
└─────────────────┼──────────────────────────────┘
                  │ HTTP POST
                  ▼
┌────────────────────────────────────────────────┐
│             Backend (Express 5)                │
│  Zod validation · CORS · dotenv               │
│                                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐│
│  │ /analyze │  │ /refine  │  │  /debug/test ││
│  └────┬─────┘  └────┬─────┘  └──────────────┘│
│       └──────┬──────┘                         │
│              ▼                                 │
│     ┌────────────────┐                        │
│     │  groq.js       │                        │
│     │  (AI service)  │                        │
│     └───────┬────────┘                        │
└─────────────┼──────────────────────────────────┘
              │ Groq API (REST)
              ▼
     ┌────────────────┐
     │  llama-3.3-70b │
     │  (or fallback) │
     └────────────────┘
```

### Frontend

The frontend is a single-page application built with **React 19**, **TypeScript 6**, and **Tailwind CSS 4**. State management is handled via React hooks in a centralized `App.tsx` state machine with four views: `input`, `interview`, `result`, and an overlay-driven `processing` state. Animations use **Framer Motion** for smooth transitions across all components — the loading overlay, the scroll cue arrow, history drawer, and result card entrance sequences.

The landing page uses a **scroll-triggered storyboard** with sections that reveal on scroll using `whileInView`. The **history system** operates entirely in `localStorage` with a max of 50 entries, grouped by date, searchable, and restorable with a single click.

### Backend

The backend is an **Express 5** API server with three endpoints:
- `POST /api/analyze` — Takes a prompt, returns score, missing info, questions, prompt blueprint, improvement report, and a formatted prompt.
- `POST /api/refine` — Takes a prompt and user answers, returns a merged final prompt.
- `POST /api/debug/test` — Test harness for frontend development with configurable mock responses.

Request bodies are validated with **Zod** schemas. The AI service (`groq.js`) builds system prompts that instruct the model to act as a Senior Prompt Engineer, iterates through a model fallback chain (`llama-3.3-70b-versatile` → `qwen-qwen3-32b`), and normalizes the parsed JSON response with defensive fallbacks for every field.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 19 |
| Build Tool | Vite 8 |
| Language | TypeScript 6 |
| Styling | Tailwind CSS 4 |
| Animation | Framer Motion 12 |
| Icons | react-icons / Lucide |
| Toast | react-hot-toast |
| Backend Framework | Express 5 |
| Validation | Zod 4 |
| AI API | Groq (REST) |
| Storage | browser localStorage |

---

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── index.js              # Express server + middleware + routing
│   │   ├── routes/
│   │   │   ├── analyze.js        # POST /api/analyze — Zod validation + AI analysis
│   │   │   ├── refine.js         # POST /api/refine — merge prompt + answers
│   │   │   └── debug.js          # POST /api/debug/test — mock test cases
│   │   └── services/
│   │       └── groq.js           # Groq API client, prompt builder, response normalizer
│   └── .env                      # GROQ_API_KEY + PORT
│
└── frontend/
    ├── src/
    │   ├── App.tsx               # Root state machine (input / interview / result)
    │   ├── types.ts              # TypeScript interfaces for all data shapes
    │   ├── index.css             # Tailwind + theme CSS variables + utilities
    │   ├── components/
    │   │   ├── Header.tsx        # Logo, history button, theme toggle
    │   │   ├── PromptInput.tsx   # Textarea + Analyze/Interview buttons
    │   │   ├── AnalysisResult.tsx# Score, blueprint, improvement report, final prompt
    │   │   ├── BlueprintView.tsx # Accordion display of prompt blueprint sections
    │   │   ├── ImprovementReport.tsx # Added/Strengths/Weaknesses tag display
    │   │   ├── InterviewFlow.tsx # Step-by-step question wizard with live preview
    │   │   ├── HistoryDrawer.tsx # Slide-in panel with search, grouping, restore
    │   │   ├── LoadingOverlay.tsx# Fullscreen blur + spinner + rotating phrases
    │   │   ├── HomeStoryboard.tsx# Scroll-triggered product story sections
    │   │   └── AILaunchHub.tsx   # Platform launch buttons (ChatGPT, Gemini, etc.)
    │   ├── hooks/
    │   │   ├── useTheme.ts       # Dark/light mode with localStorage persistence
    │   │   └── useHistory.ts     # localStorage CRUD for prompt history
    │   └── lib/
    │       ├── api.ts            # Typed HTTP client with error handling
    │       ├── errors.ts         # Error/success message catalog
    │       ├── toast.tsx         # Custom styled toast components
    │       └── utils.ts          # cn() Tailwind class merge utility
    └── index.html
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- A Groq API key (free at console.groq.com)

### Setup

```bash
# 1. Clone and install dependencies
cd backend && npm install
cd ../frontend && npm install

# 2. Configure environment
cd ../backend
cp .env.example .env   # or edit .env directly
# Set GROQ_API_KEY=your_key_here

# 3. Start the backend (runs on port 3001)
npm run dev

# 4. In a separate terminal, start the frontend (runs on port 5173)
cd ../frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## How It Works

1. **Enter a rough idea** — e.g., "Create a puzzle board game"
2. **Choose a mode:**
   - **Analyze** — Instantly returns a score, missing info, and a structured prompt blueprint.
   - **Try Interview** — The AI generates targeted questions. Answer them one by one to enrich the prompt before seeing the final result.
3. **Review the results** — The prompt blueprint (Role, Objective, Context, Requirements, Constraints, Expected Output) is displayed alongside an improvement report and a formatted final prompt.
4. **Copy or export** — Copy the refined prompt to your clipboard or open it directly in ChatGPT, Gemini, Grok, or Perplexity.
5. **History persists** — Every session is saved automatically. Click the clock icon in the header to browse, search, or restore past sessions.

---

## Design Philosophy

PromptPilot was built with three guiding principles:

1. **The prompt is the product.** Every interaction — analysis, interview, blueprint generation — exists to improve the quality of the final prompt. The UI stays out of the way.

2. **Professional, not noisy.** The interface uses minimal glassmorphism, a restrained cyan accent palette, and smooth but unobtrusive animations. The scrollbar is hidden; the scroll cue arrow guides rather than announces.

3. **Zero-friction history.** History lives in the browser. No signup, no database, no cloud sync. It's a utility, not a feature — always available via a single icon in the header.
