import { useState, useCallback } from "react";
import type { InterviewQuestion, PromptBlueprint, ImprovementReport } from "../types";

const STORAGE_KEY = "promptpilot_history";
const MAX_ENTRIES = 50;

export interface HistoryItem {
  id: string;
  title: string;
  createdAt: string;
  mode: "analyze" | "interview";
  prompt: string;
  score: number;
  missingInformation: string[];
  questions: InterviewQuestion[];
  promptBlueprint: PromptBlueprint;
  improvementReport: ImprovementReport;
  finalPrompt: string;
}

function generateId(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function generateTitle(prompt: string): string {
  const cleaned = prompt.replace(/["']/g, "").trim();
  const words = cleaned.split(/\s+/);
  if (words.length <= 4) return cleaned;
  return words.slice(0, 4).join(" ") + "...";
}

function load(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryItem[];
  } catch {
    return [];
  }
}

function save(items: HistoryItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // storage full — silently fail
  }
}

export function generateHistoryItem(
  prompt: string,
  score: number,
  missingInformation: string[],
  questions: InterviewQuestion[],
  promptBlueprint: PromptBlueprint,
  improvementReport: ImprovementReport,
  finalPrompt: string,
  mode: "analyze" | "interview",
): HistoryItem {
  return {
    id: generateId(),
    title: generateTitle(prompt),
    createdAt: new Date().toISOString(),
    mode,
    prompt,
    score,
    missingInformation,
    questions,
    promptBlueprint,
    improvementReport,
    finalPrompt,
  };
}

export function useHistory() {
  const [items, setItems] = useState<HistoryItem[]>(load);

  const refresh = useCallback(() => {
    setItems(load());
  }, []);

  const add = useCallback((item: HistoryItem) => {
    const current = load();
    current.unshift(item);
    if (current.length > MAX_ENTRIES) current.pop();
    save(current);
    setItems(current);
  }, []);

  const remove = useCallback((id: string) => {
    const current = load().filter((h) => h.id !== id);
    save(current);
    setItems(current);
  }, []);

  const clearAll = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setItems([]);
  }, []);

  return { items, add, remove, clearAll, refresh };
}
