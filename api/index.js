const express = require("express");
const cors = require("cors");

const analyzeRouter = require("../backend/src/routes/analyze");
const refineRouter = require("../backend/src/routes/refine");
const debugRouter = require("../backend/src/routes/debug");

const app = express();
app.use(cors());
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
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

module.exports = app;
