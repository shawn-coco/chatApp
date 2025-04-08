// ChatUI.tsx - 纯渲染组件
import React, { Fragment, useRef } from "react";
import styles from "./styles/chat.module.scss";
import { ChatMessage, ChatSession } from "../types";
import { MarkdownUI } from "./MarkdownUI";
import clsx from "clsx";

export interface ChatUIProps {
  // 数据
  messages: ChatMessage[];
  session: ChatSession;
  userInput?: string;
  promptHints?: string[];
  isStreaming?: boolean;
  attachedImages?: string[];
  
  // 回调函数
  onSend?: (message: string, images?: string[]) => void;
  onUserInputChange?: (input: string) => void;
  onPromptSelect?: (prompt: string) => void;
  onDelete?: (messageIndex: number) => void;
  onEdit?: (messageIndex: number, content: string) => void;
  onResend?: (messageIndex: number) => void;
  onImageUpload?: (file: File) => Promise<string>;
  onTopicChange?: (topic: string) => void;
  
  // 配置项
  config?: {
    showMessageActions: boolean;
    showTimestamp: boolean;
    enableMarkdown: boolean;
    enableImageUpload: boolean;
    enableAudio: boolean;
  }
}

export function ChatUI({
  messages,
  session,
  userInput,
  promptHints,
  isStreaming,
  attachedImages,
  onSend,
  onUserInputChange,
  onPromptSelect,
  onDelete,
  onEdit,
  onResend,
  onImageUpload,
  onTopicChange,
  config,
}: ChatUIProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  

  
  return (
    <div className={styles.chat}>
      {/* 聊天消息区域 */}
      <div className={styles["chat-body"]} ref={scrollRef}>
        {/* 标题部分 */}
        <div className={clsx("window-header", styles["chat-body-title"])}>
          <div
            className={clsx(
              "window-header-main-title",
              styles["chat-body-main-title"],
            )}
            onClick={() => onTopicChange?.(session.topic)}
          >
            {session.topic || "新对话"}
          </div>
          <div className="window-header-sub-title">
            {`${messages.length} 条消息`}
          </div>
        </div>
        
        {/* 消息列表 */}
        {messages.map((message, i) => (
          <Fragment key={message.id || i}>
            <div
              className={`${styles["chat-message"]} ${
                message.role === "user" ? styles["chat-message-user"] : ""
              }`}
            >
              <div className={styles["chat-message-container"]}>
                {/* 消息头部 */}
                <div className={styles["chat-message-header"]}>
                  <div className={styles["chat-message-avatar"]}>
                    {/* 这里可以根据角色显示不同头像 */}
                  </div>
                  
                  {config?.showMessageActions && (
                    <div className={styles["chat-message-actions"]}>
                      <div className={styles["chat-input-actions"]}>
                        {message.role !== "user" && (
                          <button onClick={() => onResend?.(i)}>重新生成</button>
                        )}
                        <button onClick={() => onEdit?.(i, message.content)}>编辑</button>
                        <button onClick={() => onDelete?.(i)}>删除</button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* 消息内容 */}
                <div className={styles["chat-message-item"]}>
                  {config?.enableMarkdown ? (
                    <MarkdownUI
                      content={message.content}
                      loading={i === messages.length - 1 && isStreaming}
                    />
                  ) : (
                    <div style={{ whiteSpace: "pre-wrap" }}>
                      {message.content}
                    </div>
                  )}
                </div>
                
                {/* 消息图片 */}
                {message.images && message.images.length > 0 && (
                  <div className={styles["chat-message-item-images"]}>
                    {message.images.map((image, idx) => (
                      <img 
                        key={idx}
                        src={image} 
                        className={styles["chat-message-item-image-multi"]}
                        alt={`图片 ${idx+1}`}
                      />
                    ))}
                  </div>
                )}
                
                {/* 音频 */}
                {config?.enableAudio && message.audio_url && (
                  <div className={styles["chat-message-audio"]}>
                    <audio src={message.audio_url} controls />
                  </div>
                )}
                
                {/* 时间戳 */}
                {config?.showTimestamp && (
                  <div className={styles["chat-message-action-date"]}>
                    {new Date(message.date || Date.now()).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}