import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { checkHealth } from "../lib/api";

interface ConnectionLoaderProps {
  onReady: () => void;
}

const WAKE_PHRASES = [
  "Connecting to PromptPilot Engine...",
  "Waking up backend...",
  "Connecting to AI engine...",
  "Preparing analysis workspace...",
  "Starting prompt services...",
  "Almost ready...",
];

const TIMEOUT_MS = 90_000;
const HEALTH_INTERVAL = 3000;

export function ConnectionLoader({ onReady }: ConnectionLoaderProps) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [timedOut, setTimedOut] = useState(false);

  const advance = useCallback(() => {
    setPhraseIndex((i) => (i + 1) % WAKE_PHRASES.length);
  }, []);

  useEffect(() => {
    const phraseInterval = setInterval(advance, 3000);
    return () => clearInterval(phraseInterval);
  }, [advance]);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      while (!cancelled) {
        const ok = await checkHealth(5000);
        if (ok && !cancelled) {
          onReady();
          return;
        }
        await new Promise((r) => setTimeout(r, HEALTH_INTERVAL));
      }
    };

    poll();

    const timeout = setTimeout(() => {
      cancelled = true;
      setTimedOut(true);
    }, TIMEOUT_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [onReady]);

  if (timedOut) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 flex flex-col items-center gap-6 rounded-2xl border border-white/10 bg-[var(--card)] px-10 py-10 shadow-2xl text-center max-w-sm"
          style={{ backdropFilter: "blur(12px)" }}
        >
          <div className="text-3xl">⏳</div>
          <p className="text-sm text-[var(--muted-foreground)]">
            PromptPilot backend is taking longer than expected.
          </p>
          <p className="text-xs text-[var(--muted-foreground)]">
            Please try again in a moment.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-cyan-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-500"
          >
            Retry
          </button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
        className="relative z-10 flex flex-col items-center gap-6 rounded-2xl border border-white/10 bg-[var(--card)] px-10 py-10 shadow-2xl"
        style={{ backdropFilter: "blur(12px)" }}
      >
        <div className="relative flex items-center justify-center">
          <svg className="h-10 w-10 -rotate-90" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="20" fill="none" stroke="var(--border)" strokeWidth="3" />
            <motion.circle
              cx="24" cy="24" r="20"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={Math.PI * 40}
              strokeDashoffset={Math.PI * 10}
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
              style={{ originX: "24px", originY: "24px" }}
            />
          </svg>
        </div>
        <div className="h-6 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={phraseIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="text-sm text-[var(--muted-foreground)] whitespace-nowrap"
            >
              {WAKE_PHRASES[phraseIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
