import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { InterviewQuestion } from "../types";

interface InterviewFlowProps {
  prompt: string;
  questions: InterviewQuestion[];
  initialAnswers?: string[];
  onComplete: (answers: string[]) => void;
  onCancel: () => void;
}

function buildPreview(prompt: string, answers: string[]) {
  const answered = answers.filter((a) => a.trim().length > 0);
  if (answered.length === 0) return `"${prompt}"`;

  return `"${prompt}"\n\nWith context:\n${answered.map((a) => `- ${a}`).join("\n")}`;
}

export function InterviewFlow({ prompt, questions, initialAnswers, onComplete, onCancel }: InterviewFlowProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(
    initialAnswers && initialAnswers.length === questions.length
      ? [...initialAnswers]
      : new Array(questions.length).fill("")
  );

  const currentQ = questions[step];
  const current = answers[step] || "";
  const progress = ((step + 1) / questions.length) * 100;
  const isLast = step === questions.length - 1;

  const handleNext = () => {
    if (!current.trim()) return;
    const updated = [...answers];
    updated[step] = current.trim();
    setAnswers(updated);

    if (isLast) {
      onComplete(updated);
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleNext();
    }
  };

  return (
    <div className="space-y-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[13px] text-[var(--muted-foreground)]">
          <span>Step {step + 1} of {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
          <motion.div
            className="h-full rounded-full bg-cyan-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {currentQ && (
            <div className="space-y-2">
              <span className="inline-block rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-0.5 text-[12px] font-medium text-cyan-400">
                {currentQ.category}
              </span>
              <h3 className="font-heading text-lg font-semibold">
                {currentQ.question}
              </h3>
            </div>
          )}
          <textarea
            value={current}
            onChange={(e) => {
              const updated = [...answers];
              updated[step] = e.target.value;
              setAnswers(updated);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer..."
            rows={3}
            autoFocus
            className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[15px] outline-none transition-colors placeholder:text-[var(--muted-foreground)] focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
          />
        </motion.div>
      </AnimatePresence>

      {/* Live Prompt Preview */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-4">
        <p className="mb-2 text-[12px] font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          Prompt Preview
        </p>
        <pre className="whitespace-pre-wrap text-[13px] leading-relaxed text-[var(--card-foreground)] font-sans">
          {buildPreview(prompt, answers)}
        </pre>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={step > 0 ? handleBack : onCancel}
          className="rounded-lg border border-[var(--border)] px-5 py-2 text-[14px] font-medium text-[var(--card-foreground)] transition-all hover:bg-[var(--muted)]"
        >
          {step > 0 ? "Back" : "Cancel"}
        </button>
        <button
          onClick={handleNext}
          disabled={!current.trim()}
          className="rounded-lg bg-cyan-500 px-6 py-2 text-[14px] font-medium text-white transition-all hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isLast ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  );
}
