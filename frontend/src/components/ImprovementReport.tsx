import { motion } from "framer-motion";
import type { ImprovementReport as ImprovementReportType } from "../types";

interface ImprovementReportProps {
  report: ImprovementReportType;
}

export function ImprovementReport({ report }: ImprovementReportProps) {
  const hasContent = report.added.length > 0 || report.strengths.length > 0 || report.weaknesses.length > 0;
  if (!hasContent) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="rounded-lg border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent p-5"
    >
      <h3 className="mb-4 font-heading text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
        Improvement Report
      </h3>

      <div className="space-y-4">
        {report.added.length > 0 && (
          <div>
            <p className="mb-2 text-[13px] font-medium text-emerald-400 uppercase tracking-wide">Added</p>
            <div className="flex flex-wrap gap-2">
              {report.added.map((item, i) => (
                <motion.span
                  key={item}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + i * 0.05, duration: 0.2 }}
                  className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[12px] text-emerald-300"
                >
                  <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {item}
                </motion.span>
              ))}
            </div>
          </div>
        )}

        {report.strengths.length > 0 && (
          <div>
            <p className="mb-2 text-[13px] font-medium text-emerald-400 uppercase tracking-wide">Strengths</p>
            <div className="flex flex-wrap gap-2">
              {report.strengths.map((item, i) => (
                <motion.span
                  key={item}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + i * 0.05, duration: 0.2 }}
                  className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[12px] text-emerald-300"
                >
                  <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {item}
                </motion.span>
              ))}
            </div>
          </div>
        )}

        {report.weaknesses.length > 0 && (
          <div>
            <p className="mb-2 text-[13px] font-medium text-amber-400 uppercase tracking-wide">Weaknesses</p>
            <ul className="space-y-1">
              {report.weaknesses.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] text-[var(--muted-foreground)]">
                  <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-amber-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
}
