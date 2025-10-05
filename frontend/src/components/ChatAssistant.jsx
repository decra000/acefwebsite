import React, { useState, useEffect, useRef } from "react";
import {
  startChatSession,
  sendMessageToChat,
  getSessionHistory,
  clearSession,
} from "../services/ChatService";

export default function ChatAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    async function initChat() {
      try {
        await startChatSession();
        const history = await getSessionHistory();
        if (history.length > 0) {
          setMessages(history);
        } else {
          setMessages([
            {
              from: "bot",
              text: `👋 Hi! I'm your ACEF assistant. I can help you with:

• Job applications and career opportunities
• Event registration
• Volunteer opportunities
• Partnership inquiries
• Donations and support
• General information about ACEF

What can I help you with today?`,
            },
          ]);
        }
      } catch (err) {
        console.error("Error initializing chat:", err);
        setMessages([{ from: "bot", text: "⚠️ Could not connect to chat server." }]);
      }
    }
    if (isOpen) {
      initChat();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { from: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput("");
    setLoading(true);

    try {
      const { reply, modelUsed, actionCompleted } = await sendMessageToChat(
        userInput
      );
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: reply,
          modelUsed,
          actionCompleted,
        },
      ]);
    } catch (err) {
      console.error("Send message error:", err);
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "⚠️ Server error, please try again.", isError: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    clearSession();
    setMessages([{ from: "bot", text: "🔄 Conversation cleared. How can I help you?" }]);
  };

  return (
    <div style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 9999 }}>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "linear-gradient(to bottom right, #16a34a, #15803d)",
            color: "white",
            fontSize: "20px",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          }}
        >
          💬
        </button>
      )}

      {isOpen && (
        <div
          style={{
            width: "400px",
            height: "600px",
            background: "white",
            borderRadius: "16px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(to right, #16a34a, #15803d)",
              color: "white",
              padding: "12px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: "16px" }}>ACEF Assistant</h3>
              <p style={{ margin: 0, fontSize: "12px", opacity: 0.8 }}>Ask me anything</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "white",
                fontSize: "18px",
                cursor: "pointer",
              }}
            >
              ✖
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px",
              background: "#f9fafb",
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: msg.from === "user" ? "flex-end" : "flex-start",
                  marginBottom: "10px",
                }}
              >
                <div
                  style={{
                    maxWidth: "70%",
                    padding: "10px 14px",
                    borderRadius: "12px",
                    background:
                      msg.from === "user"
                        ? "#16a34a"
                        : msg.isError
                        ? "#fee2e2"
                        : "white",
                    color: msg.from === "user" ? "white" : msg.isError ? "#b91c1c" : "#111827",
                    fontSize: "14px",
                    boxShadow:
                      msg.from !== "user" ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                  }}
                >
                  {msg.text}
                  {msg.modelUsed && (
                    <div style={{ fontSize: "11px", marginTop: "4px", opacity: 0.6 }}>
                      Model: {msg.modelUsed}
                    </div>
                  )}
                  {msg.actionCompleted && (
                    <div
                      style={{
                        marginTop: "6px",
                        padding: "2px 6px",
                        fontSize: "11px",
                        borderRadius: "10px",
                        background: "#dcfce7",
                        color: "#166534",
                        display: "inline-block",
                      }}
                    >
                      ✓ Action completed
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ fontSize: "12px", color: "#6b7280" }}>Typing...</div>
            )}
            <div ref={messagesEndRef}></div>
          </div>

          {/* Footer */}
          <div style={{ padding: "12px", borderTop: "1px solid #e5e7eb" }}>
            <div style={{ marginBottom: "6px" }}>
              <button
                onClick={handleClear}
                style={{
                  fontSize: "12px",
                  padding: "4px 8px",
                  background: "#f3f4f6",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Clear Chat
              </button>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <textarea
                style={{
                  flex: 1,
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  padding: "8px",
                  fontSize: "14px",
                  resize: "none",
                }}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                rows={1}
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                style={{
                  padding: "0 16px",
                  background: "#16a34a",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  opacity: loading || !input.trim() ? 0.5 : 1,
                }}
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}