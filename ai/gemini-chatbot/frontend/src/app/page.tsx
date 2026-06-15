"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import Sidebar from "@/components/Sidebar";
import { sendMessage, ChatMessage as ChatMessageType } from "@/lib/api";

interface Conversation {
  id: string;
  title: string;
  messages: ChatMessageType[];
}

const SUGGESTIONS = [
  { emoji: "💻", text: "Help me write a Python script to web scrape data" },
  { emoji: "📝", text: "Explain how async/await works in JavaScript" },
  { emoji: "🎨", text: "Design a color palette for a modern SaaS app" },
  { emoji: "🧠", text: "What are the best practices for REST API design?" },
];

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Get the active conversation
  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );
  const messages = activeConversation?.messages || [];

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Create a new conversation
  const createConversation = useCallback(
    (firstMessage: string): string => {
      const id = `conv-${Date.now()}`;
      const title =
        firstMessage.length > 40
          ? firstMessage.slice(0, 40) + "..."
          : firstMessage;
      const newConv: Conversation = { id, title, messages: [] };
      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(id);
      return id;
    },
    []
  );

  // Add a message to a conversation
  const addMessage = useCallback(
    (convId: string, message: ChatMessageType) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId ? { ...c, messages: [...c.messages, message] } : c
        )
      );
    },
    []
  );

  // Update the last message in a conversation (for streaming)
  const updateLastMessage = useCallback(
    (convId: string, updater: (content: string) => string) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== convId) return c;
          const msgs = [...c.messages];
          const lastMsg = msgs[msgs.length - 1];
          if (lastMsg && lastMsg.role === "model") {
            msgs[msgs.length - 1] = {
              ...lastMsg,
              content: updater(lastMsg.content),
            };
          }
          return { ...c, messages: msgs };
        })
      );
    },
    []
  );

  // Handle sending a message
  const handleSend = useCallback(async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isStreaming) return;

    // Determine conversation
    let convId = activeConversationId;
    if (!convId) {
      convId = createConversation(trimmed);
    }

    // Add user message
    const userMessage: ChatMessageType = { role: "user", content: trimmed };
    addMessage(convId, userMessage);
    setInputValue("");
    setIsStreaming(true);

    // Add empty AI message for streaming
    const aiMessage: ChatMessageType = { role: "model", content: "" };
    // Small delay to ensure user message renders first
    setTimeout(() => addMessage(convId!, aiMessage), 50);

    // Build full message history
    const currentConv = conversations.find((c) => c.id === convId);
    const allMessages = [
      ...(currentConv?.messages || []),
      userMessage,
    ];

    // Create abort controller
    const controller = new AbortController();
    abortControllerRef.current = controller;

    await sendMessage(
      allMessages,
      {
        onToken: (token) => {
          updateLastMessage(convId!, (prev) => prev + token);
        },
        onDone: () => {
          setIsStreaming(false);
          abortControllerRef.current = null;
        },
        onError: (error) => {
          updateLastMessage(
            convId!,
            () => `⚠️ Error: ${error}\n\nMake sure the backend server is running on port 8000.`
          );
          setIsStreaming(false);
          abortControllerRef.current = null;
        },
      },
      controller.signal
    );
  }, [
    inputValue,
    isStreaming,
    activeConversationId,
    conversations,
    createConversation,
    addMessage,
    updateLastMessage,
  ]);

  // Handle suggestion click
  const handleSuggestion = (text: string) => {
    setInputValue(text);
  };

  // Handle new chat
  const handleNewChat = () => {
    setActiveConversationId(null);
    setInputValue("");
    setSidebarOpen(false);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  };

  // Handle selecting a conversation
  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setSidebarOpen(false);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  };

  return (
    <div className="app-layout">
      {/* Mobile sidebar toggle */}
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        ☰
      </button>

      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Chat Area */}
      <main className="chat-main">
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="model-badge">
              <span className="dot" />
              Gemini 2.0 Flash
            </div>
          </div>
        </div>

        {/* Messages or Welcome Screen */}
        {messages.length === 0 ? (
          <div className="welcome-screen">
            <div className="welcome-icon">✦</div>
            <h1 className="welcome-title">Hello! I&apos;m Gemini</h1>
            <p className="welcome-subtitle">
              Your AI assistant powered by Google&apos;s Gemini 2.0 Flash.
              Ask me anything — coding, writing, analysis, or creative tasks.
            </p>
            <div className="welcome-suggestions">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  className="suggestion-card"
                  onClick={() => handleSuggestion(s.text)}
                  id={`suggestion-${i}`}
                >
                  <span className="emoji">{s.emoji}</span>
                  <span className="text">{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="messages-container">
            <div className="messages-list">
              {messages.map((msg, index) => (
                <ChatMessage
                  key={index}
                  role={msg.role}
                  content={msg.content}
                  isStreaming={
                    isStreaming &&
                    index === messages.length - 1 &&
                    msg.role === "model"
                  }
                />
              ))}

              {/* Typing indicator — shown briefly before first token arrives */}
              {isStreaming &&
                messages.length > 0 &&
                messages[messages.length - 1]?.role === "model" &&
                messages[messages.length - 1]?.content === "" && (
                  <div className="message">
                    <div className="message-avatar ai">✦</div>
                    <div className="message-content">
                      <div className="message-role ai">Gemini</div>
                      <div className="typing-indicator">
                        <div className="typing-dot" />
                        <div className="typing-dot" />
                        <div className="typing-dot" />
                      </div>
                    </div>
                  </div>
                )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Chat Input */}
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSend}
          disabled={isStreaming}
          placeholder={
            isStreaming ? "Gemini is thinking..." : "Message Gemini..."
          }
        />
      </main>
    </div>
  );
}
