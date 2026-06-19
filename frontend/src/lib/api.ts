const API_URL = import.meta.env.VITE_API_URL || "/api";
const BACKEND_URL = API_URL.replace(/\/api\/?$/, "") || "";

export class ApiError extends Error {
  errorCode: string;
  status?: number;
  constructor(errorCode: string, message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.errorCode = errorCode;
    this.status = status;
  }
}

export async function checkHealth(timeoutMs = 5000): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_URL}/health`, {
      signal: AbortSignal.timeout(timeoutMs),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function request<T>(path: string, body: unknown): Promise<T> {
  let res: Response;

  try {
    res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError("NETWORK_ERROR", "Unable to reach the service. Check your internet connection and try again.");
  }

  const json = await res.json().catch(() => ({}));

  if (!res.ok || json.success === false) {
    const errorCode = json.errorCode || "SERVER_ERROR";
    const message = json.message || "An unexpected error occurred.";
    throw new ApiError(errorCode, message, res.status);
  }

  return json.data as T;
}

export async function analyzePrompt(prompt: string, testCase?: string) {
  const path = testCase ? "/debug/test" : "/analyze";
  const body = testCase ? { testCase } : { prompt };
  return request<{
    score: number;
    missingInformation: string[];
    questions: { id: number; type: string; category: string; question: string }[];
    promptBlueprint: { role: string; objective: string; context: string; requirements: string[]; constraints: string[]; expectedOutput: string };
    improvementReport: { added: string[]; strengths: string[]; weaknesses: string[] };
    improvedPrompt: string;
  }>(path, body);
}

export async function refinePrompt(prompt: string, answers: string[]) {
  return request<{ finalPrompt: string }>("/refine", { prompt, answers });
}
