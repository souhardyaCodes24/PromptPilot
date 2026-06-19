import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { Header } from "./components/Header";
import { PromptInput } from "./components/PromptInput";
import { AnalysisResult } from "./components/AnalysisResult";
import { InterviewFlow } from "./components/InterviewFlow";
import { LoadingOverlay } from "./components/LoadingOverlay";
import { ConnectionLoader } from "./components/ConnectionLoader";
import ShinyText from "./components/ShinyText";
import LightRays from "./components/LightRays";
import { ScrollCueArrow } from "./components/ScrollCueArrow";
import { HomeStoryboard } from "./components/HomeStoryboard";
import { useTheme } from "./hooks/useTheme";
import { analyzePrompt, refinePrompt, checkHealth, ApiError } from "./lib/api";
import { getErrorInfo, getSuccessInfo } from "./lib/errors";
import { showErrorToast, showWarningToast, showSuccessToast } from "./lib/toast";
import { HistoryDrawer } from "./components/HistoryDrawer";
import { useHistory, generateHistoryItem } from "./hooks/useHistory";
import type { AnalysisResult as AnalysisResultType, AppView, QAPair, InterviewQuestion } from "./types";

type PendingAction = "analyze" | "interview";

function App() {
  const { isDark, toggle } = useTheme();
  const testCase = new URLSearchParams(window.location.search).get("testCase") || undefined;
  const [view, setView] = useState<AppView>("input");
  const [userPrompt, setUserPrompt] = useState("");
  const [result, setResult] = useState<AnalysisResultType | null>(null);
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[]>([]);
  const [interviewAnswers, setInterviewAnswers] = useState<string[]>([]);
  const [qaPairs, setQaPairs] = useState<QAPair[]>([]);
  const [processing, setProcessing] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const pendingAction = useRef<PendingAction | null>(null);
  const pendingPrompt = useRef("");
  const history = useHistory();

  useEffect(() => {
    if (view === "result" && !processing) {
      const info = getSuccessInfo("ANALYSIS_COMPLETE");
      showSuccessToast(info.title, info.description);
    }
  }, [view, processing]);

  const handleApiError = useCallback((err: unknown) => {
    if (err instanceof ApiError) {
      const info = getErrorInfo(err.errorCode, err.message);
      if (err.errorCode === "RATE_LIMIT" || err.errorCode === "REQUEST_TOO_LARGE" || err.errorCode === "EMPTY_PROMPT" || err.errorCode === "TIMEOUT") {
        showWarningToast(info.title, info.description);
      } else {
        showErrorToast(info.title, info.description);
      }
    } else {
      showErrorToast("Something Went Wrong", "An unexpected error occurred. Please try again later.");
    }
  }, []);

  const doAnalyze = useCallback(async (prompt: string) => {
    setProcessing(true);
    try {
      const result = await analyzePrompt(prompt, testCase);
      setUserPrompt(prompt);
      setResult(result);
      setView("result");
      history.add(generateHistoryItem(prompt, result.score, result.missingInformation, result.questions, result.promptBlueprint, result.improvementReport, result.improvedPrompt, "analyze"));
    } catch (err) {
      handleApiError(err);
      setView("input");
    } finally {
      setProcessing(false);
    }
  }, [testCase, handleApiError, history]);

  const doInterview = useCallback(async (prompt: string) => {
    setUserPrompt(prompt);
    setResult(null);
    setInterviewQuestions([]);
    setInterviewAnswers([]);
    setQaPairs([]);
    setProcessing(true);

    try {
      const result = await analyzePrompt(prompt, testCase);
      setInterviewQuestions(result.questions);
      setView("interview");
    } catch (err) {
      handleApiError(err);
    } finally {
      setProcessing(false);
    }
  }, [testCase, handleApiError]);

  const ensureConnection = useCallback(async (prompt: string, action: PendingAction) => {
    if (testCase) {
      if (action === "analyze") doAnalyze(prompt);
      else doInterview(prompt);
      return;
    }

    const ok = await checkHealth(3000);
    if (ok) {
      if (action === "analyze") doAnalyze(prompt);
      else doInterview(prompt);
      return;
    }

    pendingPrompt.current = prompt;
    pendingAction.current = action;
    setConnecting(true);
  }, [testCase, doAnalyze, doInterview]);

  const handleConnectReady = useCallback(() => {
    setConnecting(false);
    const prompt = pendingPrompt.current;
    const action = pendingAction.current;
    pendingPrompt.current = "";
    pendingAction.current = null;
    if (action === "analyze") doAnalyze(prompt);
    else if (action === "interview") doInterview(prompt);
  }, [doAnalyze, doInterview]);

  const handleAnalyze = (prompt: string) => {
    setInterviewQuestions([]);
    setInterviewAnswers([]);
    setQaPairs([]);
    ensureConnection(prompt, "analyze");
  };

  const handleTryInterview = (prompt: string) => {
    ensureConnection(prompt, "interview");
  };

  const handleInterviewComplete = async (answers: string[]) => {
    setProcessing(true);

    try {
      const refined = await refinePrompt(userPrompt, answers);
      const analysis = await analyzePrompt(userPrompt, testCase);
      const pairs = interviewQuestions.map((q, i) => ({ question: q.question, answer: answers[i] || "" }));
      const merged = { ...analysis, improvedPrompt: refined.finalPrompt };
      setResult(merged);
      setInterviewAnswers(answers);
      setQaPairs(pairs);
      setView("result");
      history.add(generateHistoryItem(userPrompt, merged.score, merged.missingInformation, merged.questions, merged.promptBlueprint, merged.improvementReport, merged.improvedPrompt, "interview"));
    } catch (err) {
      handleApiError(err);
      setView("input");
    } finally {
      setProcessing(false);
    }
  };

  const handleEdit = () => {
    if (interviewQuestions.length > 0) {
      setView("interview");
    } else {
      setResult(null);
      setView("input");
    }
  };

  const handleRegenerate = async () => {
    setProcessing(true);

    try {
      if (interviewAnswers.length > 0 && interviewQuestions.length > 0) {
        const refined = await refinePrompt(userPrompt, interviewAnswers);
        const analysis = await analyzePrompt(userPrompt, testCase);
        const merged = { ...analysis, improvedPrompt: refined.finalPrompt };
        setResult(merged);
        history.add(generateHistoryItem(userPrompt, merged.score, merged.missingInformation, merged.questions, merged.promptBlueprint, merged.improvementReport, merged.improvedPrompt, "interview"));
      } else {
        const result = await analyzePrompt(userPrompt, testCase);
        setResult(result);
        history.add(generateHistoryItem(userPrompt, result.score, result.missingInformation, result.questions, result.promptBlueprint, result.improvementReport, result.improvedPrompt, "analyze"));
      }
      setView("result");
    } catch (err) {
      handleApiError(err);
      setView("result");
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setView("input");
    setResult(null);
    setUserPrompt("");
    setInterviewQuestions([]);
    setInterviewAnswers([]);
    setQaPairs([]);
  };

  const handleRestoreFromHistory = (item: import("./hooks/useHistory").HistoryItem) => {
    setUserPrompt(item.prompt);
    setResult({
      score: item.score,
      missingInformation: item.missingInformation,
      questions: item.questions,
      promptBlueprint: item.promptBlueprint,
      improvementReport: item.improvementReport,
      improvedPrompt: item.finalPrompt,
    });
    setInterviewQuestions(item.questions);
    setInterviewAnswers([]);
    setQaPairs([]);
    setView("result");
    setHistoryOpen(false);
  };

  const displayQaPairs = qaPairs.length > 0 ? qaPairs : undefined;

  return (
    <div className="relative flex min-h-svh flex-col">
      <Toaster
        containerStyle={{ top: 72 }}
        toastOptions={{
          style: { background: "transparent", boxShadow: "none", padding: 0 },
        }}
      />
      <Header isDark={isDark} onToggleTheme={toggle} onOpenHistory={() => setHistoryOpen(true)} onHome={handleReset} />

      <HistoryDrawer
        open={historyOpen}
        items={history.items}
        onClose={() => setHistoryOpen(false)}
        onSelect={handleRestoreFromHistory}
        onDelete={history.remove}
        onClearAll={history.clearAll}
      />

      <LoadingOverlay active={processing} />

      {connecting && <ConnectionLoader onReady={handleConnectReady} />}

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-12">
        <AnimatePresence mode="wait">
          {view === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <section className="space-y-8">
                <div className="relative min-h-[320px] flex flex-col items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 w-full h-full">
                    <LightRays
                      raysOrigin="top-center"
                      raysColor="#14dbeb"
                      raysSpeed={1}
                      lightSpread={1}
                      rayLength={2.1}
                      pulsating={false}
                      fadeDistance={1}
                      saturation={1.2}
                      followMouse
                      mouseInfluence={0.15}
                      noiseAmount={0}
                      distortion={0}
                    />
                  </div>
                  <div className="relative z-10 space-y-3 text-center">
                    <h2 className="font-heading text-4xl font-bold tracking-tight md:text-5xl">
                      Your{" "}
                      <ShinyText
                        text="Prompt Engineering"
                        color={isDark ? "#ffffff" : "#111827"}
                        shineColor="#67e8f9"
                        speed={1}
                        spread={80}
                        delay={1}
                        yoyo
                        pauseOnHover
                      />{" "}
                      Workspace
                    </h2>
                    <p className="text-[15px] text-[var(--muted-foreground)]">
                      Analyze, interview, architect, and export production-quality prompts for any AI platform.
                    </p>
                  </div>
                </div>

                <PromptInput
                  onSubmit={handleAnalyze}
                  onInterview={handleTryInterview}
                  disabled={processing || connecting}
                />

                <ScrollCueArrow />
              </section>

              <HomeStoryboard />
            </motion.div>
          )}

          {view === "result" && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] text-[var(--muted-foreground)]">Your prompt</p>
                  <p className="text-sm font-medium">"{userPrompt}"</p>
                </div>
                <button
                  onClick={handleReset}
                  className="rounded-lg border border-[var(--border)] px-4 py-1.5 text-[13px] font-medium text-[var(--card-foreground)] transition-all hover:bg-[var(--muted)]"
                >
                  New Prompt
                </button>
              </div>
              <AnalysisResult
                result={result}
                userPrompt={userPrompt}
                qaPairs={displayQaPairs}
                onEdit={interviewQuestions.length > 0 ? handleEdit : undefined}
                onRegenerate={handleRegenerate}
              />
            </motion.div>
          )}

          {view === "interview" && (
            <motion.div
              key="interview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <p className="text-[13px] text-[var(--muted-foreground)]">Interview mode</p>
                <p className="text-sm font-medium">"{userPrompt}"</p>
              </div>
              <InterviewFlow
                prompt={userPrompt}
                questions={interviewQuestions}
                initialAnswers={interviewAnswers.length > 0 ? interviewAnswers : undefined}
                onComplete={handleInterviewComplete}
                onCancel={handleReset}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
