const express = require("express");
const cors = require("cors");
const { z } = require("zod");

// ── Groq Service ──────────────────────────────────────────────

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODELS = [
  "openai/gpt-oss-120b",
  "llama-3.3-70b-versatile",
  "qwen/qwen3-32b",
];

class GroqServiceError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}

function safeJsonParse(content) {
  try {
    return JSON.parse(content);
  } catch {}

  try {
    const cleaned = content
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    return JSON.parse(cleaned);
  } catch {}

  try {
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");
    if (start !== -1 && end !== -1) {
      return JSON.parse(content.substring(start, end + 1));
    }
  } catch {}

  return null;
}

function buildAnalysisMessages(prompt) {
  return [
    { role: "system", content: `You are a Senior Prompt Engineer.

Your job is to transform vague user ideas into professional prompt specifications.

You do NOT rewrite prompts.

You architect prompts.

Return ONLY valid JSON matching this schema:

{
  "score": number,
  "missingInformation": string[],
  "questions": [
    { "id": number, "type": "text", "category": string, "question": string }
  ],
  "promptBlueprint": {
    "role": string,
    "objective": string,
    "context": string,
    "requirements": string[],
    "constraints": string[],
    "expectedOutput": string
  },
  "improvementReport": {
    "added": string[],
    "strengths": string[],
    "weaknesses": string[]
  }
}

SCORING RULES:
0-30: Very vague — lacks core structure
31-60: Some context exists but incomplete
61-80: Mostly complete, minor gaps
81-100: Production ready

QUESTION RULES:
- Generate only the highest-value missing questions.
- Maximum 6 questions.
- Each question must help improve the final prompt.

PROMPT BLUEPRINT RULES:
- role: expert persona the AI should embody
- objective: primary goal
- context: 2-5 sentences
- requirements: minimum 3 items
- constraints: minimum 2 items
- expectedOutput: detailed and actionable

IMPROVED PROMPT RULES:
- Use sections: ROLE, OBJECTIVE, CONTEXT, REQUIREMENTS, CONSTRAINTS, EXPECTED OUTPUT
- Each section starts with the UPPERCASE label on its own line.
- Never generate a short paragraph.
- Never summarize.
- Expand missing context intelligently.
- Optimize for: ChatGPT, Gemini, Grok, Perplexity, Claude

CRITICAL RESPONSE RULES:
Do NOT wrap JSON in markdown.
Do NOT use \`\`\`json.
Do NOT explain your answer.
Do NOT add any text before the JSON.
Do NOT add any text after the JSON.
The first character of your response must be {.
The last character of your response must be }.
Return a single JSON object only.` },
    { role: "user", content: `Analyze and transform this idea into a professional prompt specification: "${prompt}"` },
  ];
}

function buildRefineMessages(prompt, answers) {
  const answersText = answers.map((a, i) => `Q${i + 1}: ${a}`).join("\n");
  return [
    { role: "system", content: `You are a Senior Prompt Engineer.

Combine the original prompt and all user answers into a single professional prompt specification.

Return ONLY valid JSON matching this schema:

{
  "finalPrompt": string
}

RULES FOR finalPrompt:
- Must contain these sections: ROLE, OBJECTIVE, CONTEXT, REQUIREMENTS, CONSTRAINTS, USER PREFERENCES, EXPECTED OUTPUT
- Each section starts with the UPPERCASE label on its own line.
- Include every user answer.
- Remove ambiguity.
- Expand vague statements.
- The result should be suitable for: ChatGPT, Gemini, Grok, Perplexity, Claude
- The prompt should typically be 250-600 words.
- Never generate a short paragraph.
- Return only JSON.

CRITICAL RESPONSE RULES:
Do NOT wrap JSON in markdown.
Do NOT use \`\`\`json.
Do NOT explain your answer.
Do NOT add any text before the JSON.
Do NOT add any text after the JSON.
The first character of your response must be {.
The last character of your response must be }.
Return a single JSON object only.` },
    { role: "user", content: `Original prompt: "${prompt}"\n\nUser answers:\n${answersText}` },
  ];
}

function getApiKey() {
  const key = process.env.GROQ_API_KEY;
  if (!key || key === "your_groq_api_key_here") {
    throw new GroqServiceError("GROQ_API_KEY is not set", "INVALID_API_KEY");
  }
  return key;
}

async function tryModel(model, messages, apiKey) {
  let response;
  try {
    response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, messages, temperature: 0.3, max_tokens: 2048, response_format: { type: "json_object" } }),
    });
  } catch (err) {
    return { error: `fetch_failed: ${err.message}` };
  }

  if (response.status === 429) throw new GroqServiceError("AI usage limit reached.", "RATE_LIMIT");
  if (response.status === 401) throw new GroqServiceError("Invalid API key.", "INVALID_API_KEY");

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    return { error: body?.error?.message || "unknown_error" };
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) return { error: "empty_response" };

  return { content };
}

async function groqRequest(messages) {
  const apiKey = getApiKey();
  let lastError = null;

  for (const model of MODELS) {
    const result = await tryModel(model, messages, apiKey);

    if (result.content) {
      const parsed = safeJsonParse(result.content);
      if (parsed) {
        if (process.env.NODE_ENV !== "production") {
          console.log(`[${model}] JSON accepted`);
        }
        return parsed;
      }
      lastError = new GroqServiceError("The AI returned an invalid response.", "INVALID_AI_RESPONSE");
      continue;
    }

    lastError = result.error;

    if (
      result.error?.includes("decommissioned") ||
      result.error?.includes("not found") ||
      result.error?.includes("model_not_found") ||
      result.error?.includes("not supported")
    ) {
      continue;
    }
  }

  if (lastError instanceof GroqServiceError) throw lastError;
  throw new GroqServiceError("The analysis engine is temporarily unavailable. Please try again later.", "MODEL_UNAVAILABLE");
}

function normalizeQuestions(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((q, i) => {
    if (typeof q === "string") return { id: i + 1, type: "text", category: "General", question: q };
    return { id: q.id ?? i + 1, type: q.type ?? "text", category: q.category ?? "General", question: q.question ?? "" };
  });
}

function normalizeImprovementReport(raw) {
  if (!raw) return { added: [], strengths: [], weaknesses: [] };
  if (Array.isArray(raw)) return { added: raw, strengths: [], weaknesses: [] };
  return {
    added: Array.isArray(raw.added) ? raw.added : [],
    strengths: Array.isArray(raw.strengths) ? raw.strengths : [],
    weaknesses: Array.isArray(raw.weaknesses) ? raw.weaknesses : [],
  };
}

function formatBlueprint(bp) {
  if (!bp) return "Refined prompt based on your input.";
  const r = (bp.role || "Expert") + "\n\n";
  const o = bp.objective ? `OBJECTIVE\n\n${bp.objective}\n\n` : "";
  const c = bp.context ? `CONTEXT\n\n${bp.context}\n\n` : "";
  const rq = Array.isArray(bp.requirements) ? `REQUIREMENTS\n${bp.requirements.map((x) => `- ${x}`).join("\n")}\n\n` : "";
  const co = Array.isArray(bp.constraints) ? `CONSTRAINTS\n${bp.constraints.map((x) => `- ${x}`).join("\n")}\n\n` : "";
  const eo = bp.expectedOutput ? `EXPECTED OUTPUT\n\n${bp.expectedOutput}` : "";
  return `ROLE\n\n${r}${o}${c}${rq}${co}${eo}`.trim();
}

async function analyzePrompt(prompt) {
  const result = await groqRequest(buildAnalysisMessages(prompt));
  const bp = result.promptBlueprint || { role: "Expert Consultant", objective: `Deliver a comprehensive solution for: ${prompt}`, context: "The user has provided a general idea that requires refinement.", requirements: ["Clear scope"], constraints: ["Must be actionable"], expectedOutput: "A complete implementation plan." };
  return {
    score: result.score ?? 50,
    missingInformation: result.missingInformation ?? [],
    questions: normalizeQuestions(result.questions),
    promptBlueprint: bp,
    improvementReport: normalizeImprovementReport(result.improvementReport),
    improvedPrompt: formatBlueprint(bp),
  };
}

async function refinePrompt(prompt, answers) {
  const result = await groqRequest(buildRefineMessages(prompt, answers));
  const raw = result.finalPrompt;
  const finalPrompt = typeof raw === "string" && raw.length > 20
    ? raw
    : `ROLE\n\nExpert Consultant\n\nOBJECTIVE\n\n${prompt}\n\nCONTEXT\n\nBased on your answers:\n${answers.map((a) => `- ${a}`).join("\n")}\n\nEXPECTED OUTPUT\n\nA complete solution as specified above.`;
  return { finalPrompt };
}

// ── Express App ────────────────────────────────────────────────

const app = express();
app.use(cors());
app.use(express.json({ limit: "100kb" }));

// Routes use no /api prefix — Vercel's api/index.js
// receives paths with /api stripped

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Analyze Route ──────────────────────────────────────────────

const analyzeSchema = z.object({
  prompt: z.string().min(1, "EMPTY_PROMPT").max(2000, "REQUEST_TOO_LARGE"),
});

function getStatus(code) {
  switch (code) {
    case "RATE_LIMIT": return 429;
    case "INVALID_API_KEY": case "MODEL_UNAVAILABLE": case "AI_PROVIDER_ERROR": return 503;
    case "INVALID_AI_RESPONSE": return 500;
    default: return 500;
  }
}

app.post("/analyze", async (req, res) => {
  const parsed = analyzeSchema.safeParse(req.body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    if (issue.message === "EMPTY_PROMPT") return res.status(400).json({ success: false, errorCode: "EMPTY_PROMPT", message: "Enter a prompt before starting analysis." });
    if (issue.message === "REQUEST_TOO_LARGE") return res.status(413).json({ success: false, errorCode: "REQUEST_TOO_LARGE", message: "Your prompt exceeds the current processing limit." });
    return res.status(400).json({ success: false, errorCode: "VALIDATION_ERROR", message: "Invalid request." });
  }
  try {
    const data = await analyzePrompt(parsed.data.prompt);
    res.json({ success: true, data });
  } catch (err) {
    if (err instanceof GroqServiceError) {
      return res.status(getStatus(err.code)).json({ success: false, errorCode: err.code, message: err.message });
    }
    console.error("analyze error:", err?.message || err);
    res.status(500).json({ success: false, errorCode: "SERVER_ERROR", message: "An unexpected error occurred. Please try again later." });
  }
});

// ── Refine Route ───────────────────────────────────────────────

const refineSchema = z.object({ prompt: z.string().min(1), answers: z.array(z.string()) });

app.post("/refine", async (req, res) => {
  const parsed = refineSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, errorCode: "VALIDATION_ERROR", message: "Invalid request." });
  try {
    const data = await refinePrompt(parsed.data.prompt, parsed.data.answers);
    res.json({ success: true, data });
  } catch (err) {
    if (err instanceof GroqServiceError) {
      return res.status(getStatus(err.code)).json({ success: false, errorCode: err.code, message: err.message });
    }
    console.error("refine error:", err?.message || err);
    res.status(500).json({ success: false, errorCode: "SERVER_ERROR", message: "An unexpected error occurred. Please try again later." });
  }
});

// ── Debug Route ────────────────────────────────────────────────

const TEST_CASES = {
  HEALTHY: { status: 200, body: { success: true, data: { score: 84, missingInformation: ["Target audience"], questions: [{ id: 1, type: "text", category: "Audience", question: "Who is the target audience?" }], promptBlueprint: { role: "Senior Designer", objective: "Create a portfolio", context: "The user wants a professional portfolio.", requirements: ["Clean layout"], constraints: ["Mobile-responsive"], expectedOutput: "A complete design." }, improvementReport: { added: ["Audience"], strengths: ["Clear idea"], weaknesses: ["Missing details"] }, improvedPrompt: "ROLE\n\nSenior Designer\n\nOBJECTIVE\n\nCreate a portfolio\n\nEXPECTED OUTPUT\n\nA complete design." } } },
  RATE_LIMIT: { status: 429, body: { success: false, errorCode: "RATE_LIMIT", message: "AI usage limit reached." } },
  SERVER_ERROR: { status: 500, body: { success: false, errorCode: "SERVER_ERROR", message: "An unexpected error occurred." } },
  TIMEOUT: { status: 200, delay: 30000, body: { success: true, data: { score: 84, missingInformation: [], questions: [], promptBlueprint: { role: "Expert", objective: "Test", context: "Test.", requirements: ["Req"], constraints: ["Con"], expectedOutput: "Out." }, improvementReport: { added: [], strengths: [], weaknesses: [] }, improvedPrompt: "ROLE\n\nExpert\n\nOBJECTIVE\n\nTest" } } },
  MODEL_UNAVAILABLE: { status: 503, body: { success: false, errorCode: "MODEL_UNAVAILABLE", message: "The analysis engine is temporarily unavailable." } },
};

app.post("/debug/test", async (req, res) => {
  const config = TEST_CASES[req.body?.testCase];
  if (!config) return res.status(400).json({ success: false, errorCode: "INVALID_TEST_CASE", message: `Unknown test case. Valid: ${Object.keys(TEST_CASES).join(", ")}` });
  if (config.delay) await new Promise((r) => setTimeout(r, config.delay));
  res.status(config.status).json(config.body);
});

// ── Error Handlers ─────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ success: false, errorCode: "NOT_FOUND", message: "The requested endpoint does not exist." });
});

app.use((err, _req, res, _next) => {
  if (err.type === "entity.too.large") {
    return res.status(413).json({ success: false, errorCode: "REQUEST_TOO_LARGE", message: "Your prompt exceeds the current processing limit." });
  }
  console.error("server error:", err?.message || err);
  res.status(500).json({ success: false, errorCode: "SERVER_ERROR", message: "An unexpected error occurred. Please try again later." });
});

module.exports = app;
