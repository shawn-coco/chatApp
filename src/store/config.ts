import {
    DEFAULT_INPUT_TEMPLATE, DEFAULT_MODELS,
    DEFAULT_TTS_ENGINE, DEFAULT_TTS_MODEL,
    DEFAULT_TTS_VOICE, ServiceProvider
} from "@/constant";





import type { Voice } from "rt-client";





export const DEFAULT_SIDEBAR_WIDTH = 300;


export type ModelSize =
    | "1024x1024"
    | "1792x1024"
    | "1024x1792"
    | "768x1344"
    | "864x1152"
    | "1344x768"
    | "1152x864"
    | "1440x720"
    | "720x1440";

export type DalleQuality = "standard" | "hd";


export type DalleStyle = "vivid" | "natural";


export enum SubmitKey {
    Enter = "Enter",
    CtrlEnter = "Ctrl + Enter",
    ShiftEnter = "Shift + Enter",
    AltEnter = "Alt + Enter",
    MetaEnter = "Meta + Enter",
  }
  

  export enum Theme {
    Auto = "auto",
    Dark = "dark",
    Light = "light",
  }
  
export type ModelType = (typeof DEFAULT_MODELS)[number]["name"];



export const DEFAULT_CONFIG = {
    lastUpdate: Date.now(), // timestamp, to merge state
  
    submitKey: SubmitKey.Enter,
    avatar: "1f603",
    fontSize: 14,
    fontFamily: "",
    theme: Theme.Auto as Theme,
    // tightBorder: !!config?.isApp,
    tightBorder: false,
    sendPreviewBubble: true,
    enableAutoGenerateTitle: true,
    sidebarWidth: DEFAULT_SIDEBAR_WIDTH,
  
    enableArtifacts: true, // show artifacts config
  
    enableCodeFold: true, // code fold config
  
    disablePromptHint: false,
  
    dontShowMaskSplashScreen: false, // dont show splash screen when create chat
    hideBuiltinMasks: false, // dont add builtin masks
  
    customModels: "",
    // models: DEFAULT_MODELS as any as LLMModel[],
  
    modelConfig: {
      model: "gpt-4o-mini" as ModelType,
      providerName: "OpenAI" as ServiceProvider,
      temperature: 0.5,
      top_p: 1,
      max_tokens: 4000,
      presence_penalty: 0,
      frequency_penalty: 0,
      sendMemory: true,
      historyMessageCount: 4,
      compressMessageLengthThreshold: 1000,
      compressModel: "",
      compressProviderName: "",
      enableInjectSystemPrompts: true,
      template: DEFAULT_INPUT_TEMPLATE,
      size: "1024x1024" as ModelSize,
      quality: "standard" as DalleQuality,
      style: "vivid" as DalleStyle,
    },
  
    ttsConfig: {
      enable: false,
      autoplay: false,
      engine: DEFAULT_TTS_ENGINE,
      model: DEFAULT_TTS_MODEL,
      voice: DEFAULT_TTS_VOICE,
      speed: 1.0,
    },
  
    realtimeConfig: {
      enable: false,
      provider: "OpenAI" as ServiceProvider,
      model: "gpt-4o-realtime-preview-2024-10-01",
      apiKey: "",
      azure: {
        endpoint: "",
        deployment: "",
      },
      temperature: 0.9,
      voice: "alloy" as Voice,
    },
  };

export type ChatConfig = typeof DEFAULT_CONFIG;

export type ModelConfig = ChatConfig["modelConfig"];