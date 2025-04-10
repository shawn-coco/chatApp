import { ModelProvider, ServiceProvider } from "@/constant";
import { ChatMessageTool } from "@/store/chatStore";
import { DalleQuality, DalleStyle, ModelSize } from "@/store/config";
import { GeminiProApi } from "./platforms/google";
import { ClaudeApi } from "./platforms/anthropic";
import { MoonshotApi } from "./platforms/moonshot";
import { SparkApi } from "./platforms/iflytek";
import { ErnieApi } from "./platforms/baidu";
import { DoubaoApi } from "./platforms/bytedance";
import { QwenApi } from "./platforms/alibaba";
import { HunyuanApi } from "./platforms/tencent";
import { DeepSeekApi } from "./platforms/deepseek";
import { XAIApi } from "./platforms/xai";
import { ChatGLMApi } from "./platforms/glm";
import { SiliconflowApi } from "./platforms/siliconflow";
import { ChatGPTApi } from "./platforms/openai";
import { ChatMessage } from "@/types";
import { getClientConfig } from "@/config/client";











export const ROLES = ["system", "user", "assistant"] as const;
export type MessageRole = (typeof ROLES)[number];

export interface MultimodalContent {
    type: "text" | "image_url";
    text?: string;
    image_url?: {
        url: string;
    };
}


export interface DalleRequestPayload {
    model: string;
    prompt: string;
    response_format: "url" | "b64_json";
    n: number;
    size: ModelSize;
    quality: DalleQuality;
    style: DalleStyle;
}


export interface LLMConfig {
    model: string;
    providerName?: string;
    temperature?: number;
    top_p?: number;
    stream?: boolean;
    presence_penalty?: number;
    frequency_penalty?: number;
    size?: DalleRequestPayload["size"];
    quality?: DalleRequestPayload["quality"];
    style?: DalleRequestPayload["style"];
}





export interface ChatOptions {
    messages: RequestMessage[];
    config: LLMConfig;

    onUpdate?: (message: string, chunk: string) => void;
    onFinish: (message: string, responseRes: Response) => void;
    onError?: (err: Error) => void;
    onController?: (controller: AbortController) => void;
    onBeforeTool?: (tool: ChatMessageTool) => void;
    onAfterTool?: (tool: ChatMessageTool) => void;
}


export interface SpeechOptions {
    model: string;
    input: string;
    voice: string;
    response_format?: string;
    speed?: number;
    onController?: (controller: AbortController) => void;
}


export interface LLMUsage {
    used: number;
    total: number;
}


export interface LLMModel {
    name: string;
    displayName?: string;
    available: boolean;
    provider: LLMModelProvider;
    sorted: number;
}


export interface LLMModelProvider {
    id: string;
    providerName: string;
    providerType: string;
    sorted: number;
}


export abstract class LLMApi {
    abstract chat(options: ChatOptions): Promise<void>;
    abstract speech(options: SpeechOptions): Promise<ArrayBuffer>;
    abstract usage(): Promise<LLMUsage>;
    abstract models(): Promise<LLMModel[]>;
}



export interface RequestMessage {
    role: MessageRole;
    content: string | MultimodalContent[];
}



export class ClientApi {
    public llm: LLMApi;

    constructor(provider: ModelProvider = ModelProvider.GPT) {
        switch (provider) {
            case ModelProvider.GeminiPro:
                this.llm = new GeminiProApi();
                break;
            case ModelProvider.Claude:
                this.llm = new ClaudeApi();
                break;
            case ModelProvider.Ernie:
                this.llm = new ErnieApi();
                break;
            case ModelProvider.Doubao:
                this.llm = new DoubaoApi();
                break;
            case ModelProvider.Qwen:
                this.llm = new QwenApi();
                break;
            case ModelProvider.Hunyuan:
                this.llm = new HunyuanApi();
                break;
            case ModelProvider.Moonshot:
                this.llm = new MoonshotApi();
                break;
            case ModelProvider.Iflytek:
                this.llm = new SparkApi();
                break;
            case ModelProvider.DeepSeek:
                this.llm = new DeepSeekApi();
                break;
            case ModelProvider.XAI:
                this.llm = new XAIApi();
                break;
            case ModelProvider.ChatGLM:
                this.llm = new ChatGLMApi();
                break;
            case ModelProvider.SiliconFlow:
                this.llm = new SiliconflowApi();
                break;
            default:
                this.llm = new ChatGPTApi();
        }
    }

    config() { }

    prompts() { }

    masks() { }

    async share(messages: ChatMessage[], avatarUrl: string | null = null) {
        const msgs = messages
            .map((m) => ({
                from: m.role === "user" ? "human" : "gpt",
                value: m.content,
            }))
            .concat([
                {
                    from: "human",
                    value:
                        "Share from [NextChat]: https://github.com/Yidadaa/ChatGPT-Next-Web",
                },
            ]);
        // 敬告二开开发者们，为了开源大模型的发展，请不要修改上述消息，此消息用于后续数据清洗使用
        // Please do not modify this message

        console.log("[Share]", messages, msgs);
        const clientConfig = getClientConfig();
        const proxyUrl = "/sharegpt";
        const rawUrl = "https://sharegpt.com/api/conversations";
        const shareUrl = clientConfig?.isApp ? rawUrl : proxyUrl;
        const res = await fetch(shareUrl, {
            body: JSON.stringify({
                avatarUrl,
                items: msgs,
            }),
            headers: {
                "Content-Type": "application/json",
            },
            method: "POST",
        });

        const resJson = await res.json();
        console.log("[Share]", resJson);
        if (resJson.id) {
            return `https://shareg.pt/${resJson.id}`;
        }
    }
}



export function getClientApi(provider: ServiceProvider): ClientApi {
    switch (provider) {
      case ServiceProvider.Google:
        return new ClientApi(ModelProvider.GeminiPro);
      case ServiceProvider.Anthropic:
        return new ClientApi(ModelProvider.Claude);
      case ServiceProvider.Baidu:
        return new ClientApi(ModelProvider.Ernie);
      case ServiceProvider.ByteDance:
        return new ClientApi(ModelProvider.Doubao);
      case ServiceProvider.Alibaba:
        return new ClientApi(ModelProvider.Qwen);
      case ServiceProvider.Tencent:
        return new ClientApi(ModelProvider.Hunyuan);
      case ServiceProvider.Moonshot:
        return new ClientApi(ModelProvider.Moonshot);
      case ServiceProvider.Iflytek:
        return new ClientApi(ModelProvider.Iflytek);
      case ServiceProvider.DeepSeek:
        return new ClientApi(ModelProvider.DeepSeek);
      case ServiceProvider.XAI:
        return new ClientApi(ModelProvider.XAI);
      case ServiceProvider.ChatGLM:
        return new ClientApi(ModelProvider.ChatGLM);
      case ServiceProvider.SiliconFlow:
        return new ClientApi(ModelProvider.SiliconFlow);
      default:
        return new ClientApi(ModelProvider.GPT);
    }
  }
  