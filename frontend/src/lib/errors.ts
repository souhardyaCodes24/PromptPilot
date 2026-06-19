const ERROR_MESSAGES: Record<string, { title: string; description: string }> = {
  RATE_LIMIT: {
    title: "Usage Limit Reached",
    description: "The AI service is currently busy. Please wait a few moments before trying again.",
  },
  NETWORK_ERROR: {
    title: "Connection Lost",
    description: "Unable to reach the service. Check your internet connection and try again.",
  },
  BACKEND_UNAVAILABLE: {
    title: "Service Unavailable",
    description: "PromptPilot is temporarily unavailable. Please try again shortly.",
  },
  MODEL_UNAVAILABLE: {
    title: "AI Service Unavailable",
    description: "The analysis engine is temporarily unavailable. Please try again later.",
  },
  INVALID_API_KEY: {
    title: "Service Configuration Error",
    description: "The AI service is currently unavailable.",
  },
  REQUEST_TOO_LARGE: {
    title: "Prompt Too Large",
    description: "Your prompt exceeds the current processing limit. Try shortening the content and resubmit.",
  },
  EMPTY_PROMPT: {
    title: "Prompt Required",
    description: "Enter a prompt before starting analysis.",
  },
  TIMEOUT: {
    title: "Request Timed Out",
    description: "The analysis is taking longer than expected. Please try again.",
  },
  SERVER_ERROR: {
    title: "Something Went Wrong",
    description: "An unexpected error occurred. Please try again later.",
  },
  INVALID_AI_RESPONSE: {
    title: "Analysis Failed",
    description: "The AI returned an invalid response. Please try again.",
  },
  AI_PROVIDER_ERROR: {
    title: "AI Service Unavailable",
    description: "The analysis engine is temporarily unavailable. Please try again later.",
  },
  NOT_FOUND: {
    title: "Service Unavailable",
    description: "PromptPilot is temporarily unavailable. Please try again shortly.",
  },
};

const SUCCESS_MESSAGES: Record<string, { title: string; description: string }> = {
  ANALYSIS_COMPLETE: {
    title: "Analysis Complete",
    description: "Your prompt has been successfully analyzed.",
  },
  PROMPT_COPIED: {
    title: "Copied",
    description: "Prompt copied to clipboard.",
  },
  PROMPT_READY: {
    title: "Prompt Ready",
    description: "Your refined prompt is ready to use.",
  },
};

export function getErrorInfo(errorCode: string, fallbackMessage?: string) {
  const info = ERROR_MESSAGES[errorCode];
  if (info) return info;
  return {
    title: "Something Went Wrong",
    description: fallbackMessage || "An unexpected error occurred. Please try again later.",
  };
}

export function getSuccessInfo(key: string) {
  return SUCCESS_MESSAGES[key] || SUCCESS_MESSAGES.ANALYSIS_COMPLETE;
}
