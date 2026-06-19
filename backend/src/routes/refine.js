const { Router } = require("express");
const { z } = require("zod");
const { refinePrompt, GroqServiceError } = require("../services/groq");

const router = Router();

const schema = z.object({
  prompt: z.string().min(1),
  answers: z.array(z.string()),
});

function respond(res, status, errorCode, message) {
  return res.status(status).json({ success: false, errorCode, message });
}

router.post("/", async (req, res) => {
  const parsed = schema.safeParse(req.body);

  if (!parsed.success) {
    return respond(res, 400, "VALIDATION_ERROR", "Invalid request.");
  }

  try {
    const { prompt, answers } = parsed.data;
    const data = await refinePrompt(prompt, answers);
    res.json({ success: true, data });
  } catch (err) {
    if (err instanceof GroqServiceError) {
      return respond(res, getStatusForCode(err.code), err.code, err.message);
    }
    console.error("Unhandled refine error:", err.message);
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
