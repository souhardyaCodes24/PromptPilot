import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PromptBlueprint } from "../types";

interface BlueprintViewProps {
  blueprint: PromptBlueprint;
}

const sections: {
  key: keyof PromptBlueprint;
  label: string;
  icon: string;
  type: "text" | "list";
}[] = [
  { key: "role", label: "Role", icon: "🎭", type: "text" },
  { key: "objective", label: "Objective", icon: "🎯", type: "text" },
  { key: "context", label: "Context", icon: "📚", type: "text" },
  { key: "requirements", label: "Requirements", icon: "📋", type: "list" },
  { key: "constraints", label: "Constraints", icon: "⚠️", type: "list" },
  { key: "expectedOutput", label: "Expected Output", icon: "📦", type: "text" },
];

export function BlueprintView({ blueprint }: BlueprintViewProps) {
  const [openSection, setOpenSection] = useState<string>(sections[0].key);

  return (
    <div className="relative overflow-hidden rounded-lg border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5" />

      <div className="relative z-10">
        <h3 className="mb-4 font-heading text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
          Prompt Blueprint
        </h3>

        <div className="space-y-2">
          {sections.map((section) => {
            const value = blueprint[section.key];
            const isEmpty =
              section.type === "text"
                ? !value || (typeof value === "string" && value.trim() === "")
                : !Array.isArray(value) || value.length === 0;

            const isOpen = openSection === section.key;

            return (
              <div key={section.key}>
                <button
                  onClick={() => setOpenSection(isOpen ? "" : section.key)}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-white/5"
                >
                  <span className="text-base">{section.icon}</span>
                  <span className="flex-1 font-medium text-[var(--card-foreground)]">
                    {section.label}
                  </span>
                  {isEmpty ? (
                    <span className="text-xs text-[var(--muted-foreground)] italic">empty</span>
                  ) : (
                    <motion.svg
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="h-4 w-4 text-[var(--muted-foreground)]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  )}
                </button>

                <AnimatePresence>
                  {isOpen && !isEmpty && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-l-2 border-cyan-500/30 ml-[18px] pl-4 pb-2 pt-1">
                        {section.type === "list" ? (
                          <ul className="space-y-1">
                            {(value as string[]).map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-[var(--card-foreground)]/80">
                                <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-[var(--card-foreground)]/80 leading-relaxed">
                            {value as string}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
