"use client"

// ChatDemo.tsx
import React, { useState, useMemo } from "react";
import { ChatUI } from "./chatUI"; // 引入之前解耦的组件
import { MarkdownUI } from "./MarkdownUI"; // 引入之前解耦的Markdown组件
import { mockSession, mockMessages } from "../mock-data";
import { ChatMessage } from "../types";

// 导入相关样式
import "./styles/chat.module.scss";
import "./styles/markdown.scss";
import "./styles/highlight.scss";
import { useChatStore } from "@/store/chatStore";
import { CHAT_PAGE_SIZE } from "@/constant";

export function ChatDemo() {
  // 状态管理

  const chatStore = useChatStore();
  const session = chatStore.currentSession();

  type RenderMessage = ChatMessage & { preview?: boolean };

   // preview messages
  const renderMessages = useMemo(() => {
    return session.messages as RenderMessage[];
  }, [
    session.messages,
  ]);


  const [msgRenderIndex, _setMsgRenderIndex] = useState(
    Math.max(0, renderMessages.length - CHAT_PAGE_SIZE),
  );

  const messages = useMemo(() => {
    const endRenderIndex = Math.min(
      msgRenderIndex + 3 * CHAT_PAGE_SIZE,
      renderMessages.length,
    );
    return renderMessages.slice(msgRenderIndex, endRenderIndex);
  }, [msgRenderIndex, renderMessages]);
  
  return (
    <div className="relative w-full h-full overflow-auto p-4">
      <h1>聊天界面演示</h1>
      <div className="relative w-full h-auto mt-4">
        <ChatUI
          messages={messages}
          session={session}
        />
      </div>
    </div>
  );
}