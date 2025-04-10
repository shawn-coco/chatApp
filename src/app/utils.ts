
import { useAccessStore } from "@/store/access";
import { RequestMessage } from "./client/api";
import { EXCLUDE_VISION_MODEL_REGEXES, REQUEST_TIMEOUT_MS, REQUEST_TIMEOUT_MS_FOR_THINKING, VISION_MODEL_REGEXES } from "@/constant";




export function safeLocalStorage(): {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
} {
  let storage: Storage | null;

  try {
    if (typeof window !== "undefined" && window.localStorage) {
      storage = window.localStorage;
    } else {
      storage = null;
    }
  } catch (e) {
    console.error("localStorage is not available:", e);
    storage = null;
  }

  return {
    getItem(key: string): string | null {
      if (storage) {
        return storage.getItem(key);
      } else {
        console.warn(
          `Attempted to get item "${key}" from localStorage, but localStorage is not available.`,
        );
        return null;
      }
    },
    setItem(key: string, value: string): void {
      if (storage) {
        storage.setItem(key, value);
      } else {
        console.warn(
          `Attempted to set item "${key}" in localStorage, but localStorage is not available.`,
        );
      }
    },
    removeItem(key: string): void {
      if (storage) {
        storage.removeItem(key);
      } else {
        console.warn(
          `Attempted to remove item "${key}" from localStorage, but localStorage is not available.`,
        );
      }
    },
    clear(): void {
      if (storage) {
        storage.clear();
      } else {
        console.warn(
          "Attempted to clear localStorage, but localStorage is not available.",
        );
      }
    },
  };
}



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


export function getMessageTextContentWithoutThinking(message: RequestMessage) {
  let content = "";
  if (typeof message.content === "string") {
    content = message.content;
  } else {
    for (const c of message.content) {
      if (c.type === "text") {
        content = c.text ?? "";
        break;
      }
    }
  }
  // Filter out thinking lines (starting with "> ")
  return content
    .split("\n")
    .filter((line) => !line.startsWith("> ") && line.trim() !== "")
    .join("\n")
    .trim();
}



export function isVisionModel(model: string) {
  const visionModels = useAccessStore.getState().visionModels;
  const envVisionModels = visionModels?.split(",").map((m) => m.trim());
  if (envVisionModels?.includes(model)) {
    return true;
  }
  return (
    !EXCLUDE_VISION_MODEL_REGEXES.some((regex) => regex.test(model)) &&
    VISION_MODEL_REGEXES.some((regex) => regex.test(model))
  );
}



export function getTimeoutMSByModel(model: string) {
  model = model.toLowerCase();
  if (
    model.startsWith("dall-e") ||
    model.startsWith("dalle") ||
    model.startsWith("o1") ||
    model.startsWith("o3") ||
    model.includes("deepseek-r") ||
    model.includes("-thinking")
  )
    return REQUEST_TIMEOUT_MS_FOR_THINKING;
  return REQUEST_TIMEOUT_MS;
}











