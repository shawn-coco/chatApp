// MarkdownUI.tsx - 解耦后的纯UI组件
import React, { useRef, useState, useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import "katex/dist/katex.min.css";
import RemarkMath from "remark-math";
import RemarkBreaks from "remark-breaks";
import RehypeKatex from "rehype-katex";
import RemarkGfm from "remark-gfm";
import RehypeHighlight from "rehype-highlight";
import { useDebouncedCallback } from "use-debounce";
import LoadingIcon from "../icons/three-dots.svg";
import ReloadButtonIcon from "../icons/reload.svg";
import clsx from "clsx";
import mermaid from "mermaid";

// 提取所有需要的类型定义
export interface MarkdownUIProps {
  content: string;
  loading?: boolean;
  fontSize?: number;
  parentRef?: React.RefObject<HTMLDivElement>;
  defaultShow?: boolean;
  
  // 回调函数
  onCopyCode?: (code: string) => void;
  onShowImageModal?: (url: string) => void;
  onMermaidRender?: (svg: string, code: string) => void;
  onContentClick?: (e: React.MouseEvent) => void;
  onLinkClick?: (link: string) => boolean;
  
  // 配置
  config?: {
    enableMermaid?: boolean;
    enableLatex?: boolean;
    enableCodeHighlight?: boolean;
    enableImagePreview?: boolean;
    enableHTMLPreview?: boolean;
    enableArtifactsShare?: boolean;
  }
}

export function MarkdownUI({
  content,
  loading = false,
  fontSize = 14,
  parentRef,
  defaultShow = true,
  onCopyCode = () => {},
  onShowImageModal = () => {},
  onMermaidRender = () => {},
  onContentClick = () => {},
  onLinkClick = () => true,
  config = {
    enableMermaid: true,
    enableLatex: true,
    enableCodeHighlight: true,
    enableImagePreview: true,
    enableHTMLPreview: true,
    enableArtifactsShare: false,
  }
}: MarkdownUIProps) {
  const [mermaidErrors, setMermaidErrors] = useState<Map<string, boolean>>(
    new Map()
  );
  
  // 转义内容处理
  const escapedContent = useMemo(() => {
    // 这里添加转义逻辑，例如转义HTML标签等
    return content;
  }, [content]);
  
  // 自定义Mermaid组件
  const MermaidComponent = ({ code }: { code: string }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [hasError, setHasError] = useState(false);
    
    useEffect(() => {
      if (!config.enableMermaid) return;
      if (!ref.current) return;
      if (mermaidErrors.get(code)) {
        setHasError(true);
        return;
      }
      
      mermaid.mermaidAPI.initialize({
        securityLevel: "loose",
        theme: "default",
      });
      
      try {
        // Create a unique ID for this diagram
        const id = "mermaid-" + Math.random().toString(36).substring(2);
        
        // Use the async rendering API
        mermaid.render(id, code).then((result) => {
          if (ref.current) {
            ref.current.innerHTML = result.svg;
            onMermaidRender(result.svg, code);
          }
        });
      } catch (e) {
        setHasError(true);
        setMermaidErrors((prev) => new Map(prev).set(code, true));
        console.error("[Mermaid] ", e);
      }
    }, [code]);
    
    return (
      <div className="mermaid-container">
        {hasError ? (
          <div className="mermaid-error">
            <p>Mermaid渲染错误</p>
            <pre>{code}</pre>
          </div>
        ) : (
          <div ref={ref} />
        )}
      </div>
    );
  };
  
  // 代码块组件
  const CodeBlock = ({ inline, className, children }: any) => {
    const text = String(children).replace(/\n$/, "");
    const lang = className ? className.replace("language-", "") : "";
    
    // 检查是否是Mermaid图表
    if (lang === "mermaid" && config.enableMermaid) {
      return <MermaidComponent code={text} />;
    }
    
    // 普通代码块
    return !inline ? (
      <div className="code-block-wrapper">
        <pre className={className}>
          <code className={className}>{text}</code>
        </pre>
        <div className="code-block-header">
          <span>{lang}</span>
          <button 
            className="copy-code-button"
            onClick={() => onCopyCode(text)}
          >
            复制代码
          </button>
        </div>
      </div>
    ) : (
      <code className={className}>{children}</code>
    );
  };
  
  // 图片组件
  const ImageComponent = (props: any) => {
    const { src, alt, ...rest } = props;
    
    return (
      <img
        src={src}
        alt={alt}
        {...rest}
        onClick={(e) => {
          if (config.enableImagePreview) {
            e.preventDefault();
            onShowImageModal(src);
          }
        }}
        style={{ cursor: config.enableImagePreview ? "pointer" : "default" }}
      />
    );
  };
  
  // 链接组件
  const LinkComponent = (props: any) => {
    const { href, children, ...rest } = props;
    
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!onLinkClick(href)) {
        e.preventDefault();
      }
    };
    
    return (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer" 
        onClick={handleClick}
        {...rest}
      >
        {children}
      </a>
    );
  };
  
  // 渲染内容
  const renderContent = () => {
    if (loading) {
      return (
        <div className="markdown-loading">
          <LoadingIcon />
        </div>
      );
    }
    return (
      <ReactMarkdown
        remarkPlugins={[
          RemarkMath,
          RemarkGfm,
          RemarkBreaks,
        ]}
        rehypePlugins={(() => {
          const plugins = [];
          if (config.enableLatex) {
            plugins.push(RehypeKatex);
          }
          if (config.enableCodeHighlight) {
            // rehype-highlight with options needs to be provided as tuple
            plugins.push([RehypeHighlight, { detect: false, ignoreMissing: true }]);
          }
          return plugins as any[];
        })()}
        components={{
          code: CodeBlock,
          img: ImageComponent,
          a: LinkComponent,
        }}
      >
        {escapedContent}
      </ReactMarkdown>
    );
  };
  
  return (
    <div 
      className="markdown-content"
      style={{ fontSize: `${fontSize}px` }}
      onClick={onContentClick}
    >
      {renderContent()}
    </div>
  );
}