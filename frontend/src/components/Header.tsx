import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenHistory: () => void;
  onHome?: () => void;
}

export function Header({ isDark, onToggleTheme, onOpenHistory, onHome }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)]">
      <button
        onClick={onHome}
        className="font-heading text-2xl font-bold tracking-tight cursor-pointer"
        style={{
          color: "#06b6d4",
          textShadow: isDark
            ? "0 0 20px rgba(6, 182, 212, 0.3), 0 0 40px rgba(6, 182, 212, 0.15)"
            : "none",
        }}
      >
        PromptPilot
      </button>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenHistory}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--muted)] text-[var(--muted-foreground)] transition-all hover:border-cyan-500/30 hover:text-cyan-400"
          aria-label="Open history"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
      </div>
    </header>
  );
}
