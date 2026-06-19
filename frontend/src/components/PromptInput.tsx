import { useState, useRef, useEffect } from "react";

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  onInterview?: (prompt: string) => void;
  disabled: boolean;
}

const SAMPLES = [
  "Make me a portfolio website",
  "Write a blog post about AI",
  "Build a landing page for a SaaS",
  "Create a study guide for Python",
];

export function PromptInput({ onSubmit, onInterview, disabled }: PromptInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (value.trim() && !disabled) {
      onSubmit(value.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What do you want to create?"
          rows={3}
          disabled={disabled}
          className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3.5 text-[15px] outline-none transition-colors placeholder:text-[var(--muted-foreground)] focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 disabled:opacity-50"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={!value.trim() || disabled}
          className="rounded-lg bg-cyan-500 px-6 py-2.5 text-[14px] font-medium text-white transition-all hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Analyze
        </button>
        <button
          onClick={() => {
            if (value.trim() && !disabled && onInterview) onInterview(value.trim());
          }}
          disabled={!value.trim() || disabled}
          className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-6 py-2.5 text-[14px] font-medium text-[var(--card-foreground)] transition-all hover:bg-[var(--muted)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Try Interview
        </button>
      </div>

      <div>
        <p className="mb-3 text-[13px] text-[var(--muted-foreground)]">
          Try something like:
        </p>
        <div className="flex flex-wrap gap-2">
          {SAMPLES.map((sample) => (
            <button
              key={sample}
              onClick={() => {
                setValue(sample);
                textareaRef.current?.focus();
              }}
              disabled={disabled}
              className="rounded-full border border-[var(--border)] bg-[var(--card)] px-3.5 py-1.5 text-[13px] text-[var(--muted-foreground)] transition-all hover:border-cyan-500/30 hover:text-cyan-500 disabled:opacity-40"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
