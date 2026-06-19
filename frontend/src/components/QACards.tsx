import { motion } from "framer-motion";
import type { QAPair } from "../types";

interface QACardsProps {
  pairs: QAPair[];
}

export function QACards({ pairs }: QACardsProps) {
  if (!pairs || pairs.length === 0) return null;

  return (
    <div className="space-y-3">
      {pairs.map((pair, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
          className="rounded-lg border-l-[3px] border-l-cyan-500 border border-[var(--border)] bg-[var(--bg)] px-4 py-3"
        >
          <p className="text-[13px] font-medium text-[var(--muted-foreground)] mb-1">
            {pair.question}
          </p>
          <p className="text-[14px] text-[var(--card-foreground)]">
            {pair.answer || <span className="italic text-[var(--muted-foreground)]">No answer</span>}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
