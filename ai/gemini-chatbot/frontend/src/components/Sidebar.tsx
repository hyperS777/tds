"use client";

import React from "react";

interface Conversation {
  id: string;
  title: string;
}

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  conversations,
  activeConversationId,
  onNewChat,
  onSelectConversation,
  isOpen,
  onClose,
}: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? "open" : ""}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? "open" : ""}`} id="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-logo">G</div>
            <span className="sidebar-title">Gemini Chat</span>
          </div>
          <button
            id="new-chat-button"
            className="new-chat-btn"
            onClick={onNewChat}
          >
            <span className="icon">＋</span>
            New Chat
          </button>
        </div>

        <div className="sidebar-conversations">
          {conversations.length === 0 ? (
            <div
              style={{
                padding: "16px",
                fontSize: "13px",
                color: "var(--text-tertiary)",
                textAlign: "center",
              }}
            >
              No conversations yet
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`conversation-item ${
                  conv.id === activeConversationId ? "active" : ""
                }`}
                onClick={() => onSelectConversation(conv.id)}
                title={conv.title}
              >
                💬 {conv.title}
              </div>
            ))
          )}
        </div>

        <div className="sidebar-footer">
          Powered by Gemini 2.0 Flash
        </div>
      </aside>
    </>
  );
}
