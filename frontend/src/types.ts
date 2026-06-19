export interface InterviewQuestion {
  id: number;
  type: string;
  category: string;
  question: string;
}

export interface PromptBlueprint {
  role: string;
  objective: string;
  context: string;
  requirements: string[];
  constraints: string[];
  expectedOutput: string;
}

export interface ImprovementReport {
  added: string[];
  strengths: string[];
  weaknesses: string[];
}

export interface AnalysisResult {
  score: number;
  missingInformation: string[];
  questions: InterviewQuestion[];
  promptBlueprint: PromptBlueprint;
  improvementReport: ImprovementReport;
  improvedPrompt: string;
}

export interface QAPair {
  question: string;
  answer: string;
}

export type AppView = "input" | "analyzing" | "result" | "interview";
