import { LLMModel } from "@/app/client/api";
import { getClientConfig } from "@/config/client";
import {
    DEFAULT_INPUT_TEMPLATE, DEFAULT_MODELS,
    DEFAULT_TTS_ENGINE, DEFAULT_TTS_MODEL,
    DEFAULT_TTS_VOICE, ServiceProvider,
    StoreKey
} from "@/constant";
import { createPersistStore } from "@/utils/store";





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

const config = getClientConfig();

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
    models: DEFAULT_MODELS as any as LLMModel[],
    enableArtifacts: true, // show artifacts config
  
    enableCodeFold: true, // code fold config
  
    disablePromptHint: false,
  
    dontShowMaskSplashScreen: false, // dont show splash screen when create chat
    hideBuiltinMasks: false, // dont add builtin masks
  
    customModels: "",
    // models: DEFAULT_MODELS as any as LLMModel[],
  
    modelConfig: {
      model: "deepseek-ai/DeepSeek-R1" as ModelType,
      providerName: "SiliconFlow" as ServiceProvider,
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
      provider: "SiliconFlow" as ServiceProvider,
      model: "deepseek-ai/DeepSeek-R1",
      apiKey: "",
      azure: {
        endpoint: "",
        deployment: "",
      },
      temperature: 0.9,
      voice: "alloy" as Voice,
    },
  };


  export const useAppConfig = createPersistStore(
    { ...DEFAULT_CONFIG },
    (set, get) => ({
      reset() {
        set(() => ({ ...DEFAULT_CONFIG }));
      },
  
      mergeModels(newModels: LLMModel[]) {
        if (!newModels || newModels.length === 0) {
          return;
        }
  
        const oldModels = get().models;
        const modelMap: Record<string, LLMModel> = {};
  
        for (const model of oldModels) {
          model.available = false;
          modelMap[`${model.name}@${model?.provider?.id}`] = model;
        }
  
        for (const model of newModels) {
          model.available = true;
          modelMap[`${model.name}@${model?.provider?.id}`] = model;
        }
  
        set(() => ({
          models: Object.values(modelMap),
        }));
      },
  
      allModels() {},
    }),
    {
      name: StoreKey.Config,
      version: 4.1,
  
      merge(persistedState, currentState) {
        const state = persistedState as ChatConfig | undefined;
        if (!state) return { ...currentState };
        const models = currentState.models.slice();
        state.models.forEach((pModel) => {
          const idx = models.findIndex(
            (v) => v.name === pModel.name && v.provider === pModel.provider,
          );
          if (idx !== -1) models[idx] = pModel;
          else models.push(pModel);
        });
        return { ...currentState, ...state, models: models };
      },
  
      migrate(persistedState, version) {
        const state = persistedState as ChatConfig;
  
        if (version < 3.4) {
          state.modelConfig.sendMemory = true;
          state.modelConfig.historyMessageCount = 4;
          state.modelConfig.compressMessageLengthThreshold = 1000;
          state.modelConfig.frequency_penalty = 0;
          state.modelConfig.top_p = 1;
          state.modelConfig.template = DEFAULT_INPUT_TEMPLATE;
          state.dontShowMaskSplashScreen = false;
          state.hideBuiltinMasks = false;
        }
  
        if (version < 3.5) {
          state.customModels = "claude,claude-100k";
        }
  
        if (version < 3.6) {
          state.modelConfig.enableInjectSystemPrompts = true;
        }
  
        if (version < 3.7) {
          state.enableAutoGenerateTitle = true;
        }
  
        if (version < 3.8) {
          state.lastUpdate = Date.now();
        }
  
        if (version < 3.9) {
          state.modelConfig.template =
            state.modelConfig.template !== DEFAULT_INPUT_TEMPLATE
              ? state.modelConfig.template
              : config?.template ?? DEFAULT_INPUT_TEMPLATE;
        }
  
        if (version < 4.1) {
          state.modelConfig.compressModel =
            DEFAULT_CONFIG.modelConfig.compressModel;
          state.modelConfig.compressProviderName =
            DEFAULT_CONFIG.modelConfig.compressProviderName;
        }
  
        return state as any;
      },
    },
  );
  

export type ChatConfig = typeof DEFAULT_CONFIG;

export type ModelConfig = ChatConfig["modelConfig"];