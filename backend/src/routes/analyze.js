const { Router } = require("express");
const { z } = require("zod");
const { analyzePrompt, GroqServiceError } = require("../services/groq");

const router = Router();

const schema = z.object({
  prompt: z.string().min(1, "EMPTY_PROMPT").max(2000, "REQUEST_TOO_LARGE"),
});

function respond(res, status, errorCode, message) {
  return res.status(status).json({ success: false, errorCode, message });
}

router.post("/", async (req, res) => {
  const parsed = schema.safeParse(req.body);

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    if (issue.message === "EMPTY_PROMPT") {
      return respond(res, 400, "EMPTY_PROMPT", "Enter a prompt before starting analysis.");
    }
    if (issue.message === "REQUEST_TOO_LARGE") {
      return respond(res, 413, "REQUEST_TOO_LARGE", "Your prompt exceeds the current processing limit. Try shortening the content and resubmit.");
    }
    return respond(res, 400, "VALIDATION_ERROR", "Invalid request.");
  }

  try {
    const { prompt } = parsed.data;
    const data = await analyzePrompt(prompt);
    res.json({ success: true, data });
  } catch (err) {
    if (err instanceof GroqServiceError) {
      return respond(res, getStatusForCode(err.code), err.code, err.message);
    }
    console.error("Unhandled analyze error:", err.message);
    respond(res, 500, "SERVER_ERROR", "An unexpected error occurred. Please try again later.");
  }
});

function getStatusForCode(code) {
  switch (code) {
    case "RATE_LIMIT": return 429;
    case "INVALID_API_KEY":
    case "MODEL_UNAVAILABLE":
    case "AI_PROVIDER_ERROR": return 503;
    case "INVALID_AI_RESPONSE": return 500;
    default: return 500;
  }
}

module.exports = router;
