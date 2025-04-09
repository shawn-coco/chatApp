










export const ROLES = ["system", "user", "assistant"] as const;
export type MessageRole = (typeof ROLES)[number];

export interface MultimodalContent {
    type: "text" | "image_url";
    text?: string;
    image_url?: {
      url: string;
    };
  }



export interface RequestMessage {
    role: MessageRole;
    content: string | MultimodalContent[];
  }
  