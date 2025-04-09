import { RequestMessage } from "@/app/client/api";

export function getMessageTextContent(message: RequestMessage) {
    if (typeof message.content === "string") {
      return message.content;
    }
    for (const c of message.content) {
      if (c.type === "text") {
        return c.text ?? "";
      }
    }
    return "";
  }