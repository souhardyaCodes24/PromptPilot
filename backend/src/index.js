require("dotenv").config();
const express = require("express");
const cors = require("cors");
const analyzeRouter = require("./routes/analyze");
const refineRouter = require("./routes/refine");
const debugRouter = require("./routes/debug");

const app = express();
const PORT = process.env.PORT || 3001;

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:4173",
  "https://promptpilot.vercel.app",
  ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(",") : []),
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(null, true);
  },
}));
app.use(express.json({ limit: "100kb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "PromptPilot Backend", timestamp: new Date().toISOString() });
});

app.use("/api/analyze", analyzeRouter);
app.use("/api/refine", refineRouter);
app.use("/api/debug", debugRouter);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    errorCode: "NOT_FOUND",
    message: "The requested endpoint does not exist.",
  });
});

app.use((err, _req, res, _next) => {
  if (err.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      errorCode: "REQUEST_TOO_LARGE",
      message: "Your prompt exceeds the current processing limit. Try shortening the content and resubmit.",
    });
  }

  console.error("Unhandled server error:", err.message);
  res.status(500).json({
    success: false,
    errorCode: "SERVER_ERROR",
    message: "An unexpected error occurred. Please try again later.",
  });
});

app.listen(PORT, () => {
  console.log(`PromptPilot backend running on port ${PORT}`);
});
