// types.ts
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  date: string;
  images?: string[];
  audio_url?: string;
  streaming?: boolean;
  model?: string;
  preview?: boolean;
  isMcpResponse?: boolean;
  isError?: boolean;
}


export interface ChatStat {
  tokenCount: number;
  wordCount: number;
  charCount: number;
}

export interface ChatSession {
  id: string;
  topic: string;
  memoryPrompt: string;
  messages: ChatMessage[];
  stat: ChatStat;
  lastUpdate: number;
  lastSummarizeIndex: number;
  clearContextIndex?: number;
}