const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODELS = [
  "qwen/qwen3-32b",
  "openai/gpt-oss-120b",
  "llama-3.3-70b-versatile"
];

class GroqServiceError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}

function buildAnalysisMessages(prompt) {
  return [
    {
      role: "system",
      content: `You are a Senior Prompt Engineer.

Your job is to transform vague user ideas into professional prompt specifications.

You do NOT rewrite prompts.

You architect prompts.

Return ONLY valid JSON.

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
  },
  "improvedPrompt": string
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
- Optimize for: ChatGPT, Gemini, Grok, Perplexity, Claude`,
    },
    {
      role: "user",
      content: `Analyze and transform this idea into a professional prompt specification: "${prompt}"`,
    },
  ];
}

function buildRefineMessages(prompt, answers) {
  const answersText = answers
    .map((a, i) => `Q${i + 1}: ${a}`)
    .join("\n");

  return [
    {
      role: "system",
      content: `You are a Senior Prompt Engineer.

Combine the original prompt and all user answers into a single professional prompt specification.

Return ONLY valid JSON.

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
- Return only JSON.`,
    },
    {
      role: "user",
      content: `Original prompt: "${prompt}"\n\nUser answers:\n${answersText}`,
    },
  ];
}

function getApiKey() {
  const key = process.env.GROQ_API_KEY;
  if (!key || key === "your_groq_api_key_here") {
    throw new GroqServiceError("GROQ_API_KEY is not set in .env", "INVALID_API_KEY");
  }
  return key;
}

async function tryModel(model, messages, apiKey) {
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.3,
      max_tokens: 2048,
    }),
  });

  if (response.status === 429) {
    throw new GroqServiceError("AI usage limit reached.", "RATE_LIMIT");
  }

  if (response.status === 401) {
    throw new GroqServiceError("Invalid API key.", "INVALID_API_KEY");
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const groqMsg = body?.error?.message || "unknown_error";
    return { error: groqMsg };
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    return { error: "empty_response" };
  }

  return { content, raw: data };
}

async function groqRequest(messages) {
  const apiKey = getApiKey();
  let lastError = null;

  for (const model of MODELS) {
    console.log(`Trying model: ${model}`);

    const result = await tryModel(model, messages, apiKey);

    if (result.content) {
      try {
        const parsed = JSON.parse(result.content);
        return parsed;
      } catch {
        console.warn(`Model ${model} returned invalid JSON, trying fallback...`);
        lastError = new GroqServiceError("The AI returned an invalid response.", "INVALID_AI_RESPONSE");
        continue;
      }
    }

    lastError = result.error;

    if (
      result.error?.includes("decommissioned") ||
      result.error?.includes("not found") ||
      result.error?.includes("model_not_found") ||
      result.error?.includes("not supported")
    ) {
      console.warn(`Model ${model} unavailable, trying fallback...`);
      continue;
    }

    if (result.error) {
      console.warn(`Model ${model} error: ${result.error}`);
    }
  }

  if (lastError instanceof GroqServiceError) throw lastError;
  throw new GroqServiceError("The analysis engine is temporarily unavailable. Please try again later.", "MODEL_UNAVAILABLE");
}

function fallbackBlueprint(prompt) {
  return {
    role: "Expert Consultant and Strategic Advisor",
    objective: `Deliver a comprehensive solution for: ${prompt}`,
    context: "The user has provided a general idea that requires refinement and structured execution across multiple dimensions.",
    requirements: ["Clear definition of scope and deliverables", "Structured approach with measurable outcomes"],
    constraints: ["Must be practical and actionable", "Should follow industry best practices"],
    expectedOutput: "A complete implementation plan with clear steps, recommendations, and actionable deliverables.",
  };
}

function formatBlueprint(bp) {
  if (!bp) return `Refined prompt based on your input.\n\nExpand your idea with more specific details about audience, goals, and requirements.`;
  const role = bp.role || "Expert";
  const objective = bp.objective || "";
  const context = bp.context || "";
  const reqs = Array.isArray(bp.requirements) ? bp.requirements : [];
  const constraints = Array.isArray(bp.constraints) ? bp.constraints : [];
  const output = bp.expectedOutput || "";

  let result = `ROLE\n\n${role}\n\n`;
  if (objective) result += `OBJECTIVE\n\n${objective}\n\n`;
  if (context) result += `CONTEXT\n\n${context}\n\n`;
  if (reqs.length > 0) result += `REQUIREMENTS\n${reqs.map((r) => `- ${r}`).join("\n")}\n\n`;
  if (constraints.length > 0) result += `CONSTRAINTS\n${constraints.map((c) => `- ${c}`).join("\n")}\n\n`;
  if (output) result += `EXPECTED OUTPUT\n\n${output}`;

  return result.trim();
}

function normalizeQuestions(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((q, i) => {
    if (typeof q === "string") {
      return { id: i + 1, type: "text", category: "General", question: q };
    }
    return {
      id: q.id ?? i + 1,
      type: q.type ?? "text",
      category: q.category ?? "General",
      question: q.question ?? "",
    };
  });
}

function normalizeImprovementReport(raw) {
  if (!raw) return { added: [], strengths: [], weaknesses: [] };
  if (Array.isArray(raw)) {
    return { added: raw, strengths: [], weaknesses: [] };
  }
  return {
    added: Array.isArray(raw.added) ? raw.added : [],
    strengths: Array.isArray(raw.strengths) ? raw.strengths : [],
    weaknesses: Array.isArray(raw.weaknesses) ? raw.weaknesses : [],
  };
}

async function analyzePrompt(prompt) {
  const result = await groqRequest(buildAnalysisMessages(prompt));

  const bp = result.promptBlueprint || fallbackBlueprint(prompt);
  const rawImproved = result.improvedPrompt;

  return {
    score: result.score ?? 50,
    missingInformation: result.missingInformation ?? [],
    questions: normalizeQuestions(result.questions),
    promptBlueprint: bp,
    improvementReport: normalizeImprovementReport(result.improvementReport),
    improvedPrompt:
      typeof rawImproved === "string" && rawImproved.length > 20
        ? rawImproved
        : formatBlueprint(bp),
  };
}

async function refinePrompt(prompt, answers) {
  const result = await groqRequest(buildRefineMessages(prompt, answers));

  const raw = result.finalPrompt;
  const finalPrompt =
    typeof raw === "string" && raw.length > 20
      ? raw
      : `ROLE\n\nExpert Consultant\n\nOBJECTIVE\n\n${prompt}\n\nCONTEXT\n\nBased on your answers:\n${answers.map((a) => `- ${a}`).join("\n")}\n\nEXPECTED OUTPUT\n\nA complete solution as specified above.`;

  return { finalPrompt };
}

module.exports = { analyzePrompt, refinePrompt, GroqServiceError };
