import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingOverlayProps {
  active: boolean;
}

const PHRASES = [
  "Analyzing your prompt...",
  "Finding missing context...",
  "Shaping a stronger structure...",
  "Almost done...",
];

export function LoadingOverlay({ active }: LoadingOverlayProps) {
  const [phraseIndex, setPhraseIndex] = useState(0);

  const advance = useCallback(() => {
    setPhraseIndex((i) => (i + 1) % PHRASES.length);
  }, []);

  useEffect(() => {
    if (!active) {
      setPhraseIndex(0);
      return;
    }
    const interval = setInterval(advance, 2200);
    return () => clearInterval(interval);
  }, [active, advance]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
        >
          {/* dark backdrop */}
          <div className="absolute inset-0 bg-black/40" />

          {/* loading card */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.25, delay: 0.05 }}
            className="relative z-10 flex flex-col items-center gap-6 rounded-2xl border border-white/10 bg-[var(--card)] px-10 py-10 shadow-2xl"
            style={{ backdropFilter: "blur(12px)" }}
          >
            {/* spinner */}
            <div className="relative flex items-center justify-center">
              <svg className="h-10 w-10 -rotate-90" viewBox="0 0 48 48">
                <circle
                  cx="24" cy="24" r="20"
                  fill="none"
                  stroke="var(--border)"
                  strokeWidth="3"
                />
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

            {/* rotating phrase */}
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
                  {PHRASES[phraseIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
