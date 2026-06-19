import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";
import type { HistoryItem } from "../hooks/useHistory";

interface HistoryDrawerProps {
  open: boolean;
  items: HistoryItem[];
  onClose: () => void;
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

function formatTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function groupItems(items: HistoryItem[]): { label: string; items: HistoryItem[] }[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const lastWeek = new Date(today.getTime() - 7 * 86400000);

  const groups: Map<string, HistoryItem[]> = new Map();

  for (const item of items) {
    const d = new Date(item.createdAt);
    let label: string;
    if (d >= today) label = "Today";
    else if (d >= yesterday) label = "Yesterday";
    else if (d >= lastWeek) label = "Last Week";
    else label = "Older";

    const arr = groups.get(label) ?? [];
    arr.push(item);
    groups.set(label, arr);
  }

  const order = ["Today", "Yesterday", "Last Week", "Older"];
  return order.filter((l) => groups.has(l)).map((l) => ({ label: l, items: groups.get(l)! }));
}

export function HistoryDrawer({ open, items, onClose, onSelect, onDelete, onClearAll }: HistoryDrawerProps) {
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const filtered = useMemo(
    () =>
      search.trim()
        ? items.filter((h) => h.title.toLowerCase().includes(search.toLowerCase()) || h.prompt.toLowerCase().includes(search.toLowerCase()))
        : items,
    [items, search],
  );

  const groups = useMemo(() => groupItems(filtered), [filtered]);

  const handleDelete = (id: string) => {
    if (confirmDelete === id) {
      onDelete(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/30"
            style={{ backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)" }}
            onClick={onClose}
          />

          {/* drawer */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed right-0 top-0 z-50 flex h-full w-full flex-col border-l border-[var(--border)] bg-[var(--bg)] sm:w-[360px]"
          >
            {/* header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
              <div>
                <h2 className="font-heading text-lg font-bold text-cyan-500">History</h2>
                <p className="text-[12px] text-[var(--muted-foreground)]">Recent Prompt Sessions</p>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted-foreground)] transition-colors hover:text-[var(--card-foreground)]"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* search */}
            <div className="px-5 py-3">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search history..."
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] py-2 pl-9 pr-3 text-[13px] outline-none transition-colors placeholder:text-[var(--muted-foreground)] focus:border-cyan-500"
                />
              </div>
            </div>

            {/* list */}
            <div className="flex-1 overflow-y-auto scrollbar-hidden px-5 pb-4">
              {groups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <svg
                    className="mb-4 h-10 w-10 text-[var(--muted-foreground)]/40"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-medium text-[var(--muted-foreground)]">No prompt history yet.</p>
                  <p className="mt-1 text-[13px] text-[var(--muted-foreground)]/60">
                    Your analyses and interviews will appear here automatically.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {groups.map((g) => (
                    <div key={g.label}>
                      <p className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                        {g.label}
                      </p>
                      <div className="space-y-2">
                        {g.items.map((item) => (
                          <div key={item.id} className="group relative">
                            <button
                              onClick={() => onSelect(item)}
                              className={cn(
                                "w-full rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-left transition-all",
                                "hover:border-cyan-500/30 hover:shadow-[0_0_12px_-4px_rgba(6,182,212,0.15)]",
                              )}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-[14px] font-medium text-[var(--card-foreground)] truncate">
                                  {item.title}
                                </p>
                                <span
                                  className={cn(
                                    "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase",
                                    item.mode === "analyze"
                                      ? "bg-cyan-500/10 text-cyan-400"
                                      : "bg-purple-500/10 text-purple-400",
                                  )}
                                >
                                  {item.mode}
                                </span>
                              </div>
                              <div className="mt-1 flex items-center gap-3 text-[12px] text-[var(--muted-foreground)]">
                                <span>Score: {item.score}</span>
                                <span>·</span>
                                <span>{formatTime(item.createdAt)}</span>
                              </div>
                            </button>

                            {/* delete button */}
                            <div className="absolute right-2 top-2 hidden group-hover:block">
                              {confirmDelete === item.id ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                    className="rounded px-2 py-0.5 text-[11px] font-medium text-red-400 hover:text-red-300"
                                  >
                                    Delete
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setConfirmDelete(null); }}
                                    className="rounded px-2 py-0.5 text-[11px] text-[var(--muted-foreground)] hover:text-[var(--card-foreground)]"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                  className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] opacity-0 transition-all hover:text-red-400 group-hover:opacity-100"
                                >
                                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* clear all */}
            {items.length > 0 && (
              <div className="border-t border-[var(--border)] px-5 py-3">
                {confirmClear ? (
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-red-400">Clear all history?</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { onClearAll(); setConfirmClear(false); }}
                        className="rounded px-3 py-1 text-[12px] font-medium text-red-400 hover:text-red-300"
                      >
                        Yes, clear
                      </button>
                      <button
                        onClick={() => setConfirmClear(false)}
                        className="rounded px-3 py-1 text-[12px] text-[var(--muted-foreground)] hover:text-[var(--card-foreground)]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmClear(true)}
                    className="w-full rounded-lg py-2 text-[13px] text-[var(--muted-foreground)] transition-colors hover:text-red-400"
                  >
                    Clear All History
                  </button>
                )}
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
