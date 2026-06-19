const { Router } = require("express");

const router = Router();

const TEST_CASES = {
  HEALTHY: {
    status: 200,
    body: {
      success: true,
      data: {
        score: 84,
        missingInformation: ["Target audience"],
        questions: [
          { id: 1, type: "text", category: "Audience", question: "Who is the target audience for this project?" },
          { id: 2, type: "text", category: "Platform", question: "What platforms should this support?" },
        ],
        promptBlueprint: {
          role: "Senior Product Designer and Web Developer",
          objective: "Create a polished portfolio website that showcases projects effectively.",
          context: "The user wants a professional portfolio website to display their work. They need a clean, modern design that appeals to potential clients and employers.",
          requirements: ["Clean and modern layout", "Project showcase with filtering", "Contact section with form"],
          constraints: ["Must load quickly", "Should be mobile-responsive"],
          expectedOutput: "A complete portfolio website design with layout mockups, component specifications, and implementation guidelines.",
        },
        improvementReport: {
          added: ["Audience targeting", "Platform requirements", "Design constraints"],
          strengths: ["Clear core idea", "Focus on professionalism"],
          weaknesses: ["Missing implementation details", "No visual style preferences"],
        },
        improvedPrompt: "ROLE\n\nSenior Product Designer and Web Developer\n\nOBJECTIVE\n\nCreate a polished portfolio website that showcases projects effectively to potential clients and employers.\n\nCONTEXT\n\nThe user is a professional looking to establish an online presence. The portfolio needs to communicate expertise, demonstrate past work quality, and provide clear contact pathways.\n\nREQUIREMENTS\n- Clean and modern layout\n- Project showcase with filtering\n- Contact section with form\n- Professional typography and visual hierarchy\n\nCONSTRAINTS\n- Must load quickly\n- Should be mobile-responsive\n\nEXPECTED OUTPUT\n\nA complete portfolio website design with layout mockups, component specifications, and implementation guidelines.",
      },
    },
  },

  RATE_LIMIT: {
    status: 429,
    body: {
      success: false,
      errorCode: "RATE_LIMIT",
      message: "AI usage limit reached.",
    },
  },

  SERVER_ERROR: {
    status: 500,
    body: {
      success: false,
      errorCode: "SERVER_ERROR",
      message: "An unexpected error occurred. Please try again later.",
    },
  },

  TIMEOUT: {
    status: 200,
    delay: 30000,
    body: {
      success: true,
      data: {
        score: 84,
        missingInformation: [],
        questions: [],
        promptBlueprint: {
          role: "Expert Consultant",
          objective: "Test timeout simulation",
          context: "This is a test case for timeout simulation.",
          requirements: ["Test requirement"],
          constraints: ["Test constraint"],
          expectedOutput: "Test output.",
        },
        improvementReport: { added: [], strengths: [], weaknesses: [] },
        improvedPrompt: "ROLE\n\nExpert Consultant\n\nOBJECTIVE\n\nTest timeout simulation\n\nEXPECTED OUTPUT\n\nTest prompt completed after timeout simulation.",
      },
    },
  },

  INVALID_JSON: {
    status: 200,
    body: "random text not json",
  },

  MISSING_FIELDS: {
    status: 200,
    body: {
      success: true,
      data: {},
    },
  },

  NULL_VALUES: {
    status: 200,
    body: {
      success: true,
      data: {
        score: null,
        missingInformation: null,
        questions: null,
        promptBlueprint: null,
        improvementReport: null,
        improvedPrompt: null,
      },
    },
  },

  MODEL_UNAVAILABLE: {
    status: 503,
    body: {
      success: false,
      errorCode: "MODEL_UNAVAILABLE",
      message: "The analysis engine is temporarily unavailable. Please try again later.",
    },
  },
};

router.post("/test", async (req, res) => {
  const { testCase } = req.body || {};
  const config = TEST_CASES[testCase];

  if (!config) {
    return res.status(400).json({
      success: false,
      errorCode: "INVALID_TEST_CASE",
      message: `Unknown test case: ${testCase}. Valid: ${Object.keys(TEST_CASES).join(", ")}`,
    });
  }

  const { status, body, delay } = config;

  if (delay) {
    await new Promise((r) => setTimeout(r, delay));
  }

  res.status(status).set("Content-Type", "application/json").send(
    typeof body === "string" ? body : JSON.stringify(body)
  );
});

module.exports = router;
