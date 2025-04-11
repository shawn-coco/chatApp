import { nanoid } from "nanoid";
import { create } from "zustand";
import { ChatMessage, ChatSession, ChatStat } from "../types";
import { defaultConfig } from "next/dist/server/config-shared";
import { DEFAULT_CONFIG, ModelConfig } from "./config";
import { DEFAULT_INPUT_TEMPLATE, DEFAULT_MODELS, DEFAULT_SYSTEM_TEMPLATE, KnowledgeCutOffDate, ServiceProvider } from "@/constant";
import cn from "@/locales/cn";
import { estimateTokenLength } from "@/utils/token";
import { getMessageTextContent, isDalle3, trimTopic } from "@/utils/utils";
import { ClientApi, getClientApi } from "@/app/client/api";
import { ChatControllerPool } from "@/app/client/controller";
import { prettyObject } from "@/utils/format";
export const ROLES = ["system", "user", "assistant"] as const;

export type MessageRole = (typeof ROLES)[number];

// export type ModelType = (typeof DEFAULT_MODELS)[number]["name"];

export type ChatMessageTool = {
  id: string;
  index?: number;
  type?: string;
  function?: {
    name: string;
    arguments?: string;
  };
  content?: string;
  isError?: boolean;
  errorMsg?: string;
};


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





// 创建一个空的会话对象
function createEmptySession(): ChatSession {
  return {
    id: nanoid(),
    topic: "新会话",
    messages: [],
    lastUpdate: Date.now(),
    lastSummarizeIndex: 0,
    memoryPrompt: "",
    stat: {
      tokenCount: 0,
      wordCount: 0,
      charCount: 0,
    },
    //   mask: createEmptyMask(),
  };
}

// 创建模拟会话数据
export const mockSessions: ChatSession[] = [
  {
    id: "session-1",
    topic: "AI 技术与应用讨论",
    messages: [
      {
        id: "msg-1",
        role: "system",
        content: "我是一个AI助手，可以帮助你解答各种问题和提供信息。",
        date: new Date(1672814400000).toLocaleString(),
      },
      {
        id: "msg-2",
        role: "user",
        content: "你好！请介绍一下什么是机器学习？",
        date: new Date(1672818900000).toLocaleString(),
      },
      {
        id: "msg-3",
        role: "assistant",
        content: "机器学习是人工智能的一个分支，它专注于开发能够从数据中学习并做出决策的算法和模型。\n\n机器学习可以分为几类主要类型：\n\n1. **监督学习**：算法从已标记的训练数据中学习，然后将所学应用到新数据上。例如分类和回归问题。\n\n2. **无监督学习**：算法从未标记的数据中发现隐藏的模式或内在结构。例如聚类和降维。\n\n3. **强化学习**：通过与环境交互来学习，通过试错来最大化某种累积奖励。\n\n机器学习在各个领域都有广泛应用，包括图像识别、自然语言处理、推荐系统等。",
        date: new Date(1672818960000).toLocaleString(),
      }
    ],
    lastUpdate: Date.now() - 86400000, // 一天前
    lastSummarizeIndex: 0,
    memoryPrompt: "",
    stat: {
      tokenCount: 350,
      wordCount: 120,
      charCount: 600,
    },
  },
  {
    id: "session-2",
    topic: "Web开发问题解答",
    messages: [
      {
        id: "msg-1",
        role: "system",
        content: "我是一个AI助手，专注于帮助解决Web开发问题。",
        date: new Date(1672860600000).toLocaleString(),
      },
      {
        id: "msg-2",
        role: "user",
        content: "React中如何使用Hooks管理状态？",
        date: new Date(1672860900000).toLocaleString(),
      },
      {
        id: "msg-3",
        role: "assistant",
        content: "在React中，Hooks是React 16.8引入的新特性，允许在函数组件中使用状态和其他React特性。\n\n最基本的Hook是`useState`，用法如下：\n\n```jsx\nimport React, { useState } from 'react';\n\nfunction Counter() {\n  // 声明一个名为\"count\"的state变量，初始值为0\n  const [count, setCount] = useState(0);\n\n  return (\n    <div>\n      <p>You clicked {count} times</p>\n      <button onClick={() => setCount(count + 1)}>\n        Click me\n      </button>\n    </div>\n  );\n}\n```\n\n其他常用的Hooks包括：\n\n1. `useEffect` - 处理副作用\n2. `useContext` - 访问Context\n3. `useReducer` - 管理复杂状态逻辑\n4. `useCallback` - 记忆函数\n5. `useMemo` - 记忆计算结果\n\n自定义Hooks也是一个强大的概念，允许你提取组件逻辑到可重用的函数中。",
        date: new Date(1672860960000).toLocaleString(),
      },
      {
        id: "msg-4",
        role: "user",
        content: "useEffect的依赖数组有什么作用？",
        date: new Date(1672861200000).toLocaleString(),
      },
      {
        id: "msg-5",
        role: "assistant",
        content: "useEffect的依赖数组决定了该Effect在什么时候执行。它的作用机制如下：\n\n1. **空依赖数组 `[]`**: Effect只在组件挂载时执行一次，卸载时执行清理函数（如果有的话）。\n   ```jsx\n   useEffect(() => {\n     console.log('Component mounted');\n     return () => console.log('Component unmounted');\n   }, []);\n   ```\n\n2. **有依赖的数组 `[dep1, dep2, ...]`**: Effect在组件挂载时执行，并且在任何依赖项改变时重新执行。\n   ```jsx\n   useEffect(() => {\n     console.log(`count changed: ${count}`);\n   }, [count]);\n   ```\n\n3. **没有依赖数组**: Effect在每次渲染后都会执行。\n   ```jsx\n   useEffect(() => {\n     console.log('This runs after every render');\n   });\n   ```\n\n依赖数组的正确使用对于避免不必要的重新渲染和无限循环非常重要。React使用Object.is比较算法来检测依赖项是否发生变化。\n\n一个常见的错误是忘记在依赖数组中包含所有Effect中使用的外部变量，这可能导致使用过时的值。ESLint插件`eslint-plugin-react-hooks`可以帮助检测这些问题。",
        date: new Date(1672861260000).toLocaleString(),
      }
    ],
    lastUpdate: Date.now() - 43200000, // 12小时前
    lastSummarizeIndex: 0,
    memoryPrompt: "",
    stat: {
      tokenCount: 580,
      wordCount: 320,
      charCount: 1500,
    },
  },
  {
    id: "session-3",
    topic: "Python数据分析",
    messages: [
      {
        id: "msg-1",
        role: "system",
        content: "我是一个AI助手，专注于Python数据分析和可视化。",
        date: new Date(1672944000000).toLocaleString(),
      },
      {
        id: "msg-2",
        role: "user",
        content: "如何用Pandas处理缺失值？",
        date: new Date(1672944300000).toLocaleString(),
      },
      {
        id: "msg-3",
        role: "assistant",
        content: "在Pandas中处理缺失值是数据清洗的重要步骤。以下是一些常用的处理缺失值的方法：\n\n1. **检测缺失值**:\n```python\n# 检查每列的缺失值\ndf.isnull().sum()\n\n# 检查每行的缺失值\ndf.isnull().sum(axis=1)\n```\n\n2. **删除缺失值**:\n```python\n# 删除包含任何缺失值的行\ndf_cleaned = df.dropna()\n\n# 删除所有值都是缺失的行\ndf_cleaned = df.dropna(how='all')\n\n# 删除缺失值超过阈值的列\ndf_cleaned = df.dropna(axis=1, thresh=len(df) * 0.7)  # 保留至少70%非缺失值的列\n```\n\n3. **填充缺失值**:\n```python\n# 用固定值填充\ndf_filled = df.fillna(0)\n\n# 用列均值填充\ndf_filled = df.fillna(df.mean())\n\n# 用前向填充\ndf_filled = df.fillna(method='ffill')\n\n# 用后向填充\ndf_filled = df.fillna(method='bfill')\n```\n\n4. **插值填充**:\n```python\n# 线性插值\ndf_interp = df.interpolate(method='linear')\n\n# 其他插值方法：'polynomial', 'spline', 'nearest'等\ndf_interp = df.interpolate(method='polynomial', order=2)\n```\n\n选择哪种方法取决于你的数据特性和分析目标。对于不同的列，可能需要采用不同的策略。",
        date: new Date(1672944420000).toLocaleString(),
      }
    ],
    lastUpdate: Date.now() - 3600000, // 1小时前
    lastSummarizeIndex: 0,
    memoryPrompt: "",
    stat: {
      tokenCount: 420,
      wordCount: 250,
      charCount: 1200,
    },
  }
];

// 初始化ChatStore的函数
export function initializeChatStore() {
  // 获取当前store状态
  const currentStore = useChatStore.getState();

  // 如果sessions为空或只有一个空会话，则加载模拟数据
  if (currentStore.sessions.length <= 1 &&
    currentStore.sessions[0]?.messages.length === 0) {
    // 设置模拟会话数据
    useChatStore.setState({
      sessions: [...mockSessions],
      currentSessionIndex: 0
    });

    console.log("ChatStore initialized with mock data");
    return true;
  }

  // 如果已经有数据，则不进行初始化
  console.log("ChatStore already has data, skipping initialization");
  return false;
}

function fillTemplateWith(input: string, modelConfig: ModelConfig) {
  const cutoff =
    KnowledgeCutOffDate[modelConfig.model] ?? KnowledgeCutOffDate.default;
  // Find the model in the DEFAULT_MODELS array that matches the modelConfig.model
  const modelInfo = DEFAULT_MODELS.find((m) => m.name === modelConfig.model);

  var serviceProvider = "OpenAI";
  if (modelInfo) {
    // TODO: auto detect the providerName from the modelConfig.model

    // Directly use the providerName from the modelInfo
    serviceProvider = modelInfo.provider.providerName;
  }

  const vars = {
    ServiceProvider: serviceProvider,
    cutoff,
    model: modelConfig.model,
    time: new Date().toString(),
    lang: 'en',
    input: input,
  };

  let output = modelConfig.template ?? DEFAULT_INPUT_TEMPLATE;

  // remove duplicate
  if (input.startsWith(output)) {
    output = "";
  }

  // must contains {{input}}
  const inputVar = "{{input}}";
  if (!output.includes(inputVar)) {
    output += "\n" + inputVar;
  }

  Object.entries(vars).forEach(([name, value]) => {
    const regex = new RegExp(`{{${name}}}`, "g");
    output = output.replace(regex, value.toString()); // Ensure value is a string
  });

  return output;
}


export const DEFAULT_TOPIC = cn.Store.DefaultTopic;

export function createMessage(override: Partial<ChatMessage>): ChatMessage {
  return {
    id: nanoid(),
    date: new Date().toLocaleString(),
    role: "user",
    content: "",
    ...override,
  };
}


function countMessages(msgs: ChatMessage[]) {
  return msgs.reduce(
    (pre, cur) => pre + estimateTokenLength(getMessageTextContent(cur)),
    0,
  );
}

// 定义存储类型
interface ChatStore {
  // 状态
  sessions: ChatSession[];
  currentSessionIndex: number;
  lastInput: string;

  // 操作
  selectSession: (index: number) => void;
  moveSession: (from: number, to: number) => void;
  newSession: () => void;
  deleteSession: (index: number) => void;
  updateSession: (
    index: number,
    updater: (session: ChatSession) => void
  ) => void;
  currentSession: () => ChatSession;
  initializeWithMockData: () => void; // 新增初始化函数
  getMemoryPrompt: () => ChatMessage | undefined;
  getMessagesWithMemory: () => ChatMessage[];
  onUserInput: (content: string, attachImages?: string[], isMcpResponse?: boolean) => Promise<void>;
  updateTargetSession: (
    targetSession: ChatSession,
    updater: (session: ChatSession) => void,
  ) => void;
  updateStat: (message: ChatMessage, session: ChatSession) => void;
  summarizeSession: (refreshTitle: boolean, targetSession: ChatSession) => void;
  onNewMessage: (message: ChatMessage, session: ChatSession) => void;
  setLastInput: (lastInput: string) => void;
}


export const useChatStore = create<ChatStore>((set, _get) => ({
  // 初始状态
  sessions: [createEmptySession()],
  currentSessionIndex: 0,
  lastInput: "",
  // 选择会话
  selectSession: (index: number) => {
    set({ currentSessionIndex: index });
  },

  // 移动会话（拖拽排序）
  moveSession: (from: number, to: number) => {
    set((state) => {
      const newSessions = [...state.sessions];
      const session = newSessions[from];
      newSessions.splice(from, 1);
      newSessions.splice(to, 0, session);

      return {
        sessions: newSessions,
        currentSessionIndex:
          state.currentSessionIndex === from
            ? to
            : state.currentSessionIndex > from && state.currentSessionIndex <= to
              ? state.currentSessionIndex - 1
              : state.currentSessionIndex < from && state.currentSessionIndex >= to
                ? state.currentSessionIndex + 1
                : state.currentSessionIndex,
      };
    });
  },

  // 创建新会话
  newSession: () => {
    set((state) => ({
      currentSessionIndex: 0,
      sessions: [createEmptySession(), ...state.sessions],
    }));
  },

  // 删除会话
  deleteSession: (index: number) => {
    set((state) => {
      let nextIndex = state.currentSessionIndex;
      const sessions = [...state.sessions];

      if (sessions.length === 1) {
        return {
          sessions: [createEmptySession()],
          currentSessionIndex: 0,
        };
      }

      sessions.splice(index, 1);

      if (index === state.currentSessionIndex) {
        nextIndex = Math.min(index, sessions.length - 1);
      } else if (index < state.currentSessionIndex) {
        nextIndex = state.currentSessionIndex - 1;
      }

      return {
        sessions,
        currentSessionIndex: nextIndex,
      };
    });
  },

  // 更新会话
  updateSession: (index: number, updater: (session: ChatSession) => void) => {
    set((state) => {
      const sessions = [...state.sessions];
      const session = { ...sessions[index] };
      updater(session);
      session.lastUpdate = Date.now();
      sessions[index] = session;
      return { sessions };
    });
  },

  updateTargetSession: (
    targetSession: ChatSession,
    updater: (session: ChatSession) => void,
  ) => {
    const sessions = _get().sessions;
    const index = sessions.findIndex((s) => s.id === targetSession.id);
    if (index < 0) return;
    updater(sessions[index]);
    set(() => ({ sessions }));
  },

  // 获取当前会话
  currentSession: () => {
    const state = _get();
    if (state.sessions.length === 0) {
      return createEmptySession();
    }
    return state.sessions[state.currentSessionIndex];
  },

  setLastInput(lastInput: string) {
    set({
      lastInput,
    });
  },

  // 初始化模拟数据
  initializeWithMockData: () => {
    set({
      sessions: [...mockSessions],
      currentSessionIndex: 0
    });
  },

  updateStat(message: ChatMessage, session: ChatSession) {
    _get().updateTargetSession(session, (session) => {
      session.stat.charCount += message.content.length;
      // TODO: should update chat count and word count
    });
  },



  summarizeSession(
    refreshTitle: boolean = false,
    targetSession: ChatSession,
  ) {
    // const config = useAppConfig.getState();
    const config = DEFAULT_CONFIG;
    const session = targetSession;
    // const modelConfig = session.mask.modelConfig;
    const modelConfig = DEFAULT_CONFIG.modelConfig;
    // skip summarize when using dalle3?
    if (isDalle3(modelConfig.model)) {
      return;
    }

    // if not config compressModel, then using getSummarizeModel
    // const [model, providerName] = modelConfig.compressModel
    //   ? [modelConfig.compressModel, modelConfig.compressProviderName]
    //   : getSummarizeModel(
    //       session.mask.modelConfig.model,
    //       session.mask.modelConfig.providerName,
    //     );
    const [model, providerName] = [modelConfig.model, modelConfig.providerName];
    const api: ClientApi = getClientApi(providerName as ServiceProvider);

    // remove error messages if any
    const messages = session.messages;

    // should summarize topic after chating more than 50 words
    const SUMMARIZE_MIN_LEN = 50;
    if (
      (config.enableAutoGenerateTitle &&
        session.topic === DEFAULT_TOPIC &&
        countMessages(messages) >= SUMMARIZE_MIN_LEN) ||
      refreshTitle
    ) {
      const startIndex = Math.max(
        0,
        messages.length - modelConfig.historyMessageCount,
      );
      const topicMessages = messages
        .slice(
          startIndex < messages.length ? startIndex : messages.length - 1,
          messages.length,
        )
        .concat(
          createMessage({
            role: "user",
            content: cn.Store.Prompt.Topic,
          }),
        );
      api.llm.chat({
        messages: topicMessages,
        config: {
          model,
          stream: false,
          providerName,
        },
        onFinish(message, responseRes) {
          if (responseRes?.status === 200) {
            _get().updateTargetSession(
              session,
              (session) =>
                (session.topic =
                  message.length > 0 ? trimTopic(message) : DEFAULT_TOPIC),
            );
          }
        },
      });
    }
    const summarizeIndex = Math.max(
      session.lastSummarizeIndex,
      session.clearContextIndex ?? 0,
    );
    let toBeSummarizedMsgs = messages
      .filter((msg) => !msg.isError)
      .slice(summarizeIndex);

    const historyMsgLength = countMessages(toBeSummarizedMsgs);

    if (historyMsgLength > (modelConfig?.max_tokens || 4000)) {
      const n = toBeSummarizedMsgs.length;
      toBeSummarizedMsgs = toBeSummarizedMsgs.slice(
        Math.max(0, n - modelConfig.historyMessageCount),
      );
    }
    const memoryPrompt = _get().getMemoryPrompt();
    if (memoryPrompt) {
      // add memory prompt
      toBeSummarizedMsgs.unshift(memoryPrompt);
    }

    const lastSummarizeIndex = session.messages.length;

    console.log(
      "[Chat History] ",
      toBeSummarizedMsgs,
      historyMsgLength,
      modelConfig.compressMessageLengthThreshold,
    );

    if (
      historyMsgLength > modelConfig.compressMessageLengthThreshold &&
      modelConfig.sendMemory
    ) {
      /** Destruct max_tokens while summarizing
       * this param is just shit
       **/
      const { max_tokens, ...modelcfg } = modelConfig;
      api.llm.chat({
        messages: toBeSummarizedMsgs.concat(
          createMessage({
            role: "system",
            content: cn.Store.Prompt.Summarize,
            date: "",
          }),
        ),
        config: {
          ...modelcfg,
          stream: true,
          model,
          providerName,
        },
        onUpdate(message) {
          session.memoryPrompt = message;
        },
        onFinish(message, responseRes) {
          if (responseRes?.status === 200) {
            console.log("[Memory] ", message);
            _get().updateTargetSession(session, (session) => {
              session.lastSummarizeIndex = lastSummarizeIndex;
              session.memoryPrompt = message; // Update the memory prompt for stored it in local storage
            });
          }
        },
        onError(err) {
          console.error("[Summarize] ", err);
        },
      });
    }
  },

  onNewMessage(message: ChatMessage, targetSession: ChatSession) {
    _get().updateTargetSession(targetSession, (session) => {
      session.messages = session.messages.concat();
      session.lastUpdate = Date.now();
    });

    _get().updateStat(message, targetSession);

    // _get().checkMcpJson(message);

    _get().summarizeSession(false, targetSession);
  },


  getMemoryPrompt: () => {
    const session = _get().currentSession();
    if (session.memoryPrompt.length) {
      return {
        role: "system",
        content: cn.Store.Prompt.History(session.memoryPrompt),
        date: "",
      } as ChatMessage;
    }
  },
  


  getMessagesWithMemory() {
    const session = _get().currentSession();
    const modelConfig = DEFAULT_CONFIG.modelConfig;
    const clearContextIndex = session.clearContextIndex ?? 0;
    const messages = session.messages.slice();
    const totalMessageCount = session.messages.length;

    // in-context prompts
    // const contextPrompts = session.mask.context.slice();
    const contextPrompts: ChatMessage[] = [];

    // system prompts, to get close to OpenAI Web ChatGPT
    const shouldInjectSystemPrompts =
      modelConfig.enableInjectSystemPrompts 
      // &&(session.mask.modelConfig.model.startsWith("gpt-") ||session.mask.modelConfig.model.startsWith("chatgpt-"));

    // const mcpEnabled = await isMcpEnabled();
    const mcpEnabled = false;
    // const mcpSystemPrompt = mcpEnabled ? await getMcpSystemPrompt() : "";
    const mcpSystemPrompt = "";

    var systemPrompts: ChatMessage[] = [];

    if (shouldInjectSystemPrompts) {
      systemPrompts = [
        createMessage({
          role: "system",
          content:
            fillTemplateWith("", {
              ...modelConfig,
              template: DEFAULT_SYSTEM_TEMPLATE,
            }) + mcpSystemPrompt,
        }),
      ];
    } else if (mcpEnabled) {
      systemPrompts = [
        createMessage({
          role: "system",
          content: mcpSystemPrompt,
        }),
      ];
    }

    if (shouldInjectSystemPrompts || mcpEnabled) {
      console.log(
        "[Global System Prompt] ",
        systemPrompts.at(0)?.content ?? "empty",
      );
    }
    const memoryPrompt = _get().getMemoryPrompt();
    // long term memory
    const shouldSendLongTermMemory =
      modelConfig.sendMemory &&
      session.memoryPrompt &&
      session.memoryPrompt.length > 0 &&
      session.lastSummarizeIndex > clearContextIndex;
    const longTermMemoryPrompts =
      shouldSendLongTermMemory && memoryPrompt ? [memoryPrompt] : [];
    const longTermMemoryStartIndex = session.lastSummarizeIndex;

    // short term memory
    const shortTermMemoryStartIndex = Math.max(
      0,
      totalMessageCount - modelConfig.historyMessageCount,
    );

    // lets concat send messages, including 4 parts:
    // 0. system prompt: to get close to OpenAI Web ChatGPT
    // 1. long term memory: summarized memory messages
    // 2. pre-defined in-context prompts
    // 3. short term memory: latest n messages
    // 4. newest input message
    const memoryStartIndex = shouldSendLongTermMemory
      ? Math.min(longTermMemoryStartIndex, shortTermMemoryStartIndex)
      : shortTermMemoryStartIndex;
    // and if user has cleared history messages, we should exclude the memory too.
    const contextStartIndex = Math.max(clearContextIndex, memoryStartIndex);
    const maxTokenThreshold = modelConfig.max_tokens;

    // get recent messages as much as possible
    const reversedRecentMessages = [];
    for (
      let i = totalMessageCount - 1, tokenCount = 0;
      i >= contextStartIndex && tokenCount < maxTokenThreshold;
      i -= 1
    ) {
      const msg = messages[i];
      if (!msg || msg.isError) continue;
      tokenCount += estimateTokenLength(getMessageTextContent(msg));
      reversedRecentMessages.push(msg);
    }
    // concat all messages
    const recentMessages:ChatMessage[] = [
      ...systemPrompts,
      ...longTermMemoryPrompts,
      ...contextPrompts,
      ...reversedRecentMessages.reverse(),
    ];

    return recentMessages;
  },


  async onUserInput(
    content: string,
    attachImages?: string[],
    isMcpResponse?: boolean,
  ) {
    const session = _get().currentSession();
    // const modelConfig = session.mask.modelConfig;
    const modelConfig = DEFAULT_CONFIG.modelConfig;

    // MCP Response no need to fill template
    // let mContent: string | MultimodalContent[] = isMcpResponse
    //   ? content
    //   : fillTemplateWith(content, modelConfig);

    let mContent: string = content;

    // if (!isMcpResponse && attachImages && attachImages.length > 0) {
    //   mContent = [
    //     ...(content ? [{ type: "text" as const, text: content }] : []),
    //     ...attachImages.map((url) => ({
    //       type: "image_url" as const,
    //       image_url: { url },
    //     })),
    //   ];
    // }

    let userMessage: ChatMessage = createMessage({
      role: "user",
      content: mContent,
      isMcpResponse,
    });

    const botMessage: ChatMessage = createMessage({
      role: "assistant",
      streaming: true,
      model: DEFAULT_CONFIG.modelConfig.model,
    });

    // get recent messages
    const recentMessages = _get().getMessagesWithMemory();
    const sendMessages = recentMessages.concat(userMessage);
    const messageIndex = session.messages.length + 1;

    // save user's and bot's message
    _get().updateTargetSession(session, (session) => {
      const savedUserMessage = {
        ...userMessage,
        content: mContent,
      };
      session.messages = session.messages.concat([
        savedUserMessage,
        botMessage,
      ]);
    });

    const api: ClientApi = getClientApi(modelConfig.providerName);
    // make request
    api.llm.chat({
      messages: sendMessages,
      config: { ...modelConfig, stream: true },
      onUpdate(message) {
        botMessage.streaming = true;
        if (message) {
          botMessage.content = message;
        }
        _get().updateTargetSession(session, (session) => {
          session.messages = session.messages.concat();
        });
      },
      async onFinish(message) {
        botMessage.streaming = false;
        if (message) {
          botMessage.content = message;
          botMessage.date = new Date().toLocaleString();
          _get().onNewMessage(botMessage, session);
        }
        ChatControllerPool.remove(session.id, botMessage.id);
      },
      onBeforeTool(tool: ChatMessageTool) {
        (botMessage.tools = botMessage?.tools || []).push(tool);
        _get().updateTargetSession(session, (session) => {
          session.messages = session.messages.concat();
        });
      },
      onAfterTool(tool: ChatMessageTool) {
        botMessage?.tools?.forEach((t, i, tools) => {
          if (tool.id == t.id) {
            tools[i] = { ...tool };
          }
        });
        _get().updateTargetSession(session, (session) => {
          session.messages = session.messages.concat();
        });
      },
      onError(error) {
        const isAborted = error.message?.includes?.("aborted");
        botMessage.content +=
          "\n\n" +
          prettyObject({
            error: true,
            message: error.message,
          });
        botMessage.streaming = false;
        userMessage.isError = !isAborted;
        botMessage.isError = !isAborted;
        _get().updateTargetSession(session, (session) => {
          session.messages = session.messages.concat();
        });
        ChatControllerPool.remove(
          session.id,
          botMessage.id ?? messageIndex,
        );
        console.error("[Chat] failed ", error);
      },
      onController(controller) {
        // collect controller for stop/retry
        ChatControllerPool.addController(
          session.id,
          botMessage.id ?? messageIndex,
          controller,
        );
      },
    });
  },




}));

// 自动初始化ChatStore (可以在应用启动时调用)
// initializeChatStore();
