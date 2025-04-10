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



  export function isDalle3(model: string) {
    return "dall-e-3" === model;
  }



  export function trimTopic(topic: string) {
    // Fix an issue where double quotes still show in the Indonesian language
    // This will remove the specified punctuation from the end of the string
    // and also trim quotes from both the start and end if they exist.
    return (
      topic
        // fix for gemini
        .replace(/^["“”*]+|["“”*]+$/g, "")
        .replace(/[，。！？”“"、,.!?*]*$/, "")
    );
  }