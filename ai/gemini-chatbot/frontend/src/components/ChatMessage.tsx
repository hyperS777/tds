"use client";


import React from "react";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  role: "user" | "model";
  content: string;
  isStreaming?: boolean;
}

export default function ChatMessage({
  role,
  content,
  isStreaming = false,
}: ChatMessageProps) {
  const isUser = role === "user";

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="message" id={`message-${role}-${Date.now()}`}>
      {/* Avatar */}
      <div className={`message-avatar ${isUser ? "user" : "ai"}`}>
        {isUser ? "Y" : "✦"}
      </div>

      {/* Content */}
      <div className="message-content">
        <div className={`message-role ${isUser ? "user" : "ai"}`}>
          {isUser ? "You" : "Gemini"}
        </div>

        <div
          className={`message-bubble ${isUser ? "user" : "ai"} ${isStreaming ? "streaming-cursor" : ""
            }`}
        >
          {isUser ? (
            <p>{content}</p>
          ) : (
            <ReactMarkdown
              components={{
                pre({ children }) {
                  // Extract the language and code from the children
                  const child = React.Children.toArray(children)[0];
                  let codeContent = "";
                  let language = "";

                  if (React.isValidElement(child)) {
                    const props = child.props as {
                      className?: string;
                      children?: React.ReactNode;
                    };
                    const className = props.className || "";
                    language =
                      className.replace("language-", "") || "code";
                    codeContent = String(props.children || "").replace(
                      /\n$/,
                      ""
                    );
                  }

                  return (
                    <div>
                      <div className="code-header">
                        <span>{language}</span>
                        <button
                          className="copy-btn"
                          onClick={() => handleCopy(codeContent)}
                        >
                          📋 Copy
                        </button>
                      </div>
                      <pre>
                        <code>{codeContent}</code>
                      </pre>
                    </div>
                  );
                },
                code({ children, className, ...rest }) {
                  const isInline = !className;
                  if (isInline) {
                    return <code {...rest}>{children}</code>;
                  }
                  return (
                    <code className={className} {...rest}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
}
