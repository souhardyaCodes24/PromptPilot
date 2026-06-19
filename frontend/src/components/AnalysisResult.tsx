import { motion } from "framer-motion";
import { showSuccessToast } from "../lib/toast";
import { getSuccessInfo } from "../lib/errors";
import { QACards } from "./QACards";
import { BlueprintView } from "./BlueprintView";
import { ImprovementReport } from "./ImprovementReport";
import { AILaunchHub } from "./AILaunchHub";
import type { AnalysisResult as ResultType, QAPair } from "../types";

interface AnalysisResultProps {
  result: ResultType;
  userPrompt: string;
  qaPairs?: QAPair[];
  onEdit?: () => void;
  onRegenerate?: () => void;
}

function ScoreRing({ score }: { score: number }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth="6"
        />
        <motion.circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke="#06b6d4"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <motion.span
        className="absolute font-heading text-2xl font-bold text-cyan-500"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        {score}
      </motion.span>
    </div>
  );
}

export function AnalysisResult({ result, userPrompt: _userPrompt, qaPairs, onEdit, onRegenerate }: AnalysisResultProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="grid gap-6 md:grid-cols-5"
    >
      {/* LEFT COLUMN */}
      <div className="space-y-6 md:col-span-3">
        {/* Score + Improvement Report */}
        <div className="space-y-3">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
            <h3 className="mb-4 font-heading text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
              Prompt Quality
            </h3>
            <div className="flex items-center gap-4">
              <ScoreRing score={result.score} />
              <p className="text-sm text-[var(--muted-foreground)]">
                {result.score < 40
                  ? "Your prompt needs more detail to get the best result."
                  : result.score < 70
                  ? "Your prompt has some detail but could be stronger."
                  : "Your prompt is well-structured and detailed."}
              </p>
            </div>
          </div>

          {result.improvementReport && (
            <ImprovementReport report={result.improvementReport} />
          )}
        </div>

        {/* Missing Information */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
          <h3 className="mb-3 font-heading text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
            Missing Information
          </h3>
          {result.missingInformation.length > 0 ? (
            <ul className="space-y-2">
              {result.missingInformation.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--muted-foreground)] italic">None identified</p>
          )}
        </div>

        {/* Prompt Blueprint */}
        {result.promptBlueprint && (
          <BlueprintView blueprint={result.promptBlueprint} />
        )}

        {/* Q&A Cards */}
        {qaPairs && qaPairs.length > 0 && (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
            <h3 className="mb-3 font-heading text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
              Your Answers
            </h3>
            <QACards pairs={qaPairs} />
          </div>
        )}
      </div>

      {/* RIGHT COLUMN — Refined Prompt + AI Launch Hub */}
      <div className="md:col-span-2">
        <div className="sticky top-6 space-y-6">
          <div className="space-y-4 rounded-lg border border-cyan-500/20 bg-[var(--card)] p-5">
            <h3 className="font-heading text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
              Refined Prompt
            </h3>

            <div className="max-h-[50vh] overflow-y-auto scrollbar-hidden rounded-md border border-[var(--border)] bg-[var(--bg)] p-4">
              <pre className="whitespace-pre-wrap text-[14px] leading-relaxed text-[var(--card-foreground)] font-sans">
                {result.improvedPrompt}
              </pre>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(result.improvedPrompt);
                  const info = getSuccessInfo("PROMPT_COPIED");
                  showSuccessToast(info.title, info.description, 2000);
                }}
                className="w-full rounded-md bg-cyan-500 px-4 py-2.5 text-[14px] font-medium text-white transition-all hover:bg-cyan-600"
              >
                Copy Prompt
              </button>

              {onEdit && (
                <button
                  onClick={onEdit}
                  className="w-full rounded-md border border-[var(--border)] px-4 py-2 text-[14px] font-medium text-[var(--card-foreground)] transition-all hover:bg-[var(--muted)]"
                >
                  Edit Answers
                </button>
              )}

              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="w-full rounded-md border border-[var(--border)] px-4 py-2 text-[14px] font-medium text-[var(--card-foreground)] transition-all hover:bg-[var(--muted)]"
                >
                  Regenerate
                </button>
              )}
            </div>
          </div>

          <AILaunchHub />
        </div>
      </div>
    </motion.div>
  );
}
