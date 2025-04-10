// ChatUI.tsx - 纯渲染组件
import React, { Fragment, useRef, useState } from "react";
import styles from "./styles/chat.module.scss";
import { ChatMessage, ChatSession } from "../types";
import { MarkdownUI } from "./MarkdownUI";
import clsx from "clsx";
import { IconButton } from "./button";
import SendWhiteIcon from "../icons/send-white.svg";
import { useChatStore } from "@/store/chatStore";

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
  isStreaming,
  onDelete,
  onEdit,
  onResend,
  onTopicChange,
  config,
}: ChatUIProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [userInput, setUserInput] = useState("");
  const [inputRows, setInputRows] = useState(2);

  const [isLoading, setIsLoading] = useState(false);
  const chatStore = useChatStore();

  const doSubmit = (userInput: string) => {
    if (userInput.trim() === "") return;
    // const matchCommand = chatCommands.match(userInput);
    // if (matchCommand.matched) {
    //   setUserInput("");
    //   setPromptHints([]);
    //   matchCommand.invoke();
    //   return;
    // }
    setIsLoading(true);
    chatStore.onUserInput(userInput).then(() => setIsLoading(false));
    // setAttachImages([]);
    chatStore.setLastInput(userInput);
    setUserInput("");
    // setPromptHints([]);
    // if (!isMobileScreen) inputRef.current?.focus();
    // setAutoScroll(true);
  };

  
  return (
    <div className={styles.chat}>
      {/* 聊天消息区域 */}
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
      <div className={styles["chat-main"]}>
        <div className={styles["chat-body-container"]}>
          <div className={styles["chat-body"]} ref={scrollRef}>
            {/* 消息列表 */}
            {messages.map((message, i) => (
              <Fragment key={message.id || i}>
                <div
                  className={`${styles["chat-message"]} ${message.role === "user" ? styles["chat-message-user"] : ""
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
                            alt={`图片 ${idx + 1}`}
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
          <div className={styles["chat-input-panel"]}>
            <label
              // className={clsx(styles["chat-input-panel-inner"], {
              //   [styles["chat-input-panel-inner-attach"]]: attachImages.length !== 0,
              // })}
              className={clsx(styles["chat-input-panel-inner"])}
              htmlFor="chat-input"
            >
              <textarea
                id="chat-input"
                ref={inputRef}
                className={styles["chat-input"]}
                placeholder={" enter to send, / to search prompts, : to use commands"}
                // onInput={(e) => onInput(e.currentTarget.value)}
                value={userInput}
                // onKeyDown={onInputKeyDown}
                // onFocus={scrollToBottom}
                // onClick={scrollToBottom}
                // onPaste={handlePaste}
                rows={inputRows}
                // autoFocus={autoFocus}
                // style={{
                //   fontSize: config.fontSize,
                //   fontFamily: config.fontFamily,
                // }}
              />
              <IconButton
                icon={<SendWhiteIcon />}
                text={'send'}
                className={styles["chat-input-send"]}
                type="primary"
              onClick={() => doSubmit(userInput)}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}