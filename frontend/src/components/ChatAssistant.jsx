import React, { useState, useEffect, useRef } from "react";

// Import your ChatService
// Update this import path based on your project structure
import {
  startChatSession,
  sendMessageToChat,
  getSessionHistory,
  clearSession,
} from "../services/ChatService";

const useTheme = () => {
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  
  React.useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('acef-theme');
      if (savedTheme === 'dark') {
        setIsDarkMode(true);
      }
    } catch (e) {
      console.warn('Could not read theme preference');
    }
  }, []);
  
  const baseColors = {
    primary: "#0a451c",
    primaryDark: "#052310",
    primaryLight: "#1a5a2c",
    white: "#ffffff",
  };
  
  return {
    colors: isDarkMode ? {
      ...baseColors,
      surface: "#1f2937",
      backgroundSecondary: "#111827",
      text: "#f3f4f6",
      textSecondary: "#d1d5db",
      border: "#374151",
      borderLight: "#4b5563",
      cardShadow: "rgba(0, 0, 0, 0.3)",
      accentLight: "#1e3a1f",
    } : {
      ...baseColors,
      surface: "#ffffff",
      backgroundSecondary: "#f8f9fa",
      text: "#212529",
      textSecondary: "#6c757d",
      border: "#dee2e6",
      borderLight: "#e9ecef",
      cardShadow: "rgba(0, 0, 0, 0.1)",
      accentLight: "#e7f3ff",
    },
    isDarkMode,
  };
};

export default function ChatAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("+254712345678");
  const [showWhatsappMenu, setShowWhatsappMenu] = useState(false);
  const messagesEndRef = useRef(null);
  const { colors, isDarkMode } = useTheme();
  
  const whatsappGreen = "#25d366";
  const whatsappGreenDark = "#1eaa51";

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
              text: `👋 Hi! I'm your ACEF assistant. I can help you with:\n\n• Job applications\n• Event registration\n• Volunteer opportunities\n• Partnerships\n• Donations\n• General info\n\nWhat can I help you with?`,
            },
          ]);
        }
      } catch (err) {
        console.error("Error initializing chat:", err);
        setMessages([
          {
            from: "bot",
            text: "⚠️ Could not connect to chat server.",
          },
        ]);
      }
    }
    if (isOpen) {
      initChat();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Fetch WhatsApp number from API
  useEffect(() => {
    const fetchWhatsappNumber = async () => {
      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${API_URL}/whatsapp`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("WhatsApp data fetched:", data);
        
        if (data && Array.isArray(data) && data.length > 0) {
          setWhatsappNumber(data[0].number);
          console.log("WhatsApp number set to:", data[0].number);
        } else if (data && data.number) {
          setWhatsappNumber(data.number);
          console.log("WhatsApp number set to:", data.number);
        }
      } catch (err) {
        console.error("Error fetching WhatsApp number:", err);
      }
    };
    fetchWhatsappNumber();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { from: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput("");
    setLoading(true);

    try {
      const { reply, modelUsed, actionCompleted } =
        await sendMessageToChat(userInput);
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
        {
          from: "bot",
          text: "⚠️ Server error, please try again.",
          isError: true,
        },
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
    setMessages([
      {
        from: "bot",
        text: "🔄 Conversation cleared. How can I help you?",
      },
    ]);
  };

  const handleWhatsappClick = () => {
    if (whatsappNumber) {
      const url = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}`;
      window.open(url, "_blank");
      setShowWhatsappMenu(false);
    }
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 10000,
        }}
      >
        {!isOpen && (
          <img
            src="/bird.png"
            alt="Open chat"
            onClick={() => setIsOpen(true)}
            onError={() => setImageError(true)}
            style={{
              width: "60px",
              height: "60px",
              cursor: "pointer",
              transform: "scaleX(-1)",
              display: imageError ? "none" : "block",
              borderRadius: "50%",
            }}
          />
        )}

        {!isOpen && imageError && (
          <button
            data-utility-button
            onClick={() => setIsOpen(true)}
            style={{
              width: "60px",
              height: "60px",
              minWidth: "60px",
              minHeight: "60px",
              maxWidth: "60px",
              maxHeight: "60px",
              borderRadius: "50%",
              background: `linear-gradient(to bottom right, ${colors.primary}, ${colors.primaryDark})`,
              color: colors.white,
              fontSize: "28px",
              border: "none",
              cursor: "pointer",
              boxShadow: `0 4px 12px rgba(0,0,0,0.2)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              overflow: "hidden",
              transition: "all 0.3s ease",
              margin: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow = `0 6px 16px rgba(0,0,0,0.3)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = `0 4px 12px rgba(0,0,0,0.2)`;
            }}
          >
            💬
          </button>
        )}

        {isOpen && (
          <>
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.3)",
                zIndex: 9997,
              }}
              onClick={() => setIsOpen(false)}
            />

            <div
              style={{
                position: "fixed",
                bottom: "20px",
                right: "20px",
                width: "90vw",
                maxWidth: "500px",
                height: "90vh",
                maxHeight: "600px",
                background: colors.surface,
                borderRadius: "16px",
                boxShadow: `0 6px 20px ${colors.cardShadow}`,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                border: `1px solid ${colors.border}`,
                zIndex: 9998,
                boxSizing: "border-box",
              }}
            >
              {/* Header */}
              <div
                style={{
                  background: `linear-gradient(to right, ${colors.primary}, ${colors.primaryDark})`,
                  color: colors.white,
                  padding: "12px 16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>
                    ACEF Assistant
                  </h3>
                  <p
                    style={{ margin: 0, fontSize: "12px", opacity: 0.9 }}
                  >
                    Ask me anything
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: colors.white,
                    fontSize: "20px",
                    cursor: "pointer",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    transition: "background 0.2s ease",
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
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
                  overflowX: "hidden",
                  padding: "12px",
                  background: colors.backgroundSecondary,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent:
                        msg.from === "user" ? "flex-end" : "flex-start",
                      marginBottom: "8px",
                      alignItems: "flex-end",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "85%",
                        padding: "10px 12px",
                        borderRadius: "12px",
                        background:
                          msg.from === "user"
                            ? colors.primary
                            : msg.isError
                            ? "#fee2e2"
                            : colors.surface,
                        color:
                          msg.from === "user"
                            ? colors.white
                            : msg.isError
                            ? "#b91c1c"
                            : colors.text,
                        fontSize: "13px",
                        lineHeight: "1.4",
                        boxShadow:
                          msg.from !== "user"
                            ? `0 1px 4px ${colors.cardShadow}`
                            : "none",
                        whiteSpace: "pre-wrap",
                        wordWrap: "break-word",
                        wordBreak: "break-word",
                      }}
                    >
                      {msg.text}
                      {msg.modelUsed && (
                        <div
                          style={{
                            fontSize: "10px",
                            marginTop: "4px",
                            opacity: 0.6,
                          }}
                        >
                          {msg.modelUsed}
                        </div>
                      )}
                      {msg.actionCompleted && (
                        <div
                          style={{
                            marginTop: "4px",
                            padding: "2px 6px",
                            fontSize: "10px",
                            borderRadius: "10px",
                            background: colors.accentLight,
                            color: colors.primaryDark,
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
                  <div
                    style={{
                      fontSize: "12px",
                      color: colors.textSecondary,
                      marginTop: "8px",
                    }}
                  >
                    Typing...
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Footer */}
              <div
                style={{
                  padding: "12px",
                  borderTop: `1px solid ${colors.border}`,
                  background: colors.surface,
                  flexShrink: 0,
                }}
              >
                {/* Top row: Clear Chat & WhatsApp */}
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginBottom: "8px",
                  }}
                >
                  <button
                    onClick={handleClear}
                    style={{
                      fontSize: "12px",
                      padding: "6px 10px",
                      background: colors.backgroundSecondary,
                      border: `1px solid ${colors.border}`,
                      borderRadius: "6px",
                      cursor: "pointer",
                      color: colors.text,
                      transition: "all 0.2s ease",
                      flex: 1,
                      minHeight: "36px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = colors.borderLight;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        colors.backgroundSecondary;
                    }}
                  >
                    🗑️ Clear
                  </button>

                  <div style={{ position: "relative", flex: 1 }}>
                    <button
                      onClick={() => setShowWhatsappMenu(!showWhatsappMenu)}
                      style={{
                        width: "100%",
                        padding: "6px 10px",
                        background: whatsappGreen,
                        color: colors.white,
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        fontSize: "14px",
                        fontWeight: 600,
                        minHeight: "36px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = whatsappGreenDark;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = whatsappGreen;
                      }}
                    >
                      💬 WhatsApp
                    </button>

                    {showWhatsappMenu && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: "calc(100% + 8px)",
                          right: 0,
                          minWidth: "200px",
                          background: colors.surface,
                          border: `1px solid ${colors.border}`,
                          borderRadius: "8px",
                          boxShadow: `0 -4px 12px ${colors.cardShadow}`,
                          zIndex: 10001,
                          padding: "8px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "12px",
                            color: colors.textSecondary,
                            marginBottom: "8px",
                            textAlign: "center",
                            wordBreak: "break-all",
                          }}
                        >
                          {whatsappNumber}
                        </div>
                        <button
                          onClick={handleWhatsappClick}
                          style={{
                            width: "100%",
                            padding: "8px",
                            background: whatsappGreen,
                            color: colors.white,
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: 600,
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = whatsappGreenDark;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = whatsappGreen;
                          }}
                        >
                          Open WhatsApp
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom row: Input & Send */}
                <div style={{ display: "flex", gap: "8px" }}>
                  <textarea
                    style={{
                      flex: 1,
                      border: `1px solid ${colors.border}`,
                      borderRadius: "8px",
                      padding: "8px",
                      fontSize: "14px",
                      resize: "none",
                      background: colors.surface,
                      color: colors.text,
                      fontFamily: "inherit",
                      minHeight: "36px",
                      maxHeight: "80px",
                      boxSizing: "border-box",
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
                      padding: "8px 12px",
                      background: colors.primary,
                      color: colors.white,
                      border: "none",
                      borderRadius: "8px",
                      cursor:
                        loading || !input.trim() ? "not-allowed" : "pointer",
                      opacity: loading || !input.trim() ? 0.5 : 1,
                      transition: "all 0.2s ease",
                      fontSize: "16px",
                      fontWeight: "bold",
                      minHeight: "36px",
                      minWidth: "40px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onMouseEnter={(e) => {
                      if (!loading && input.trim()) {
                        e.currentTarget.style.background = colors.primaryLight;
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = colors.primary;
                    }}
                  >
                    ➤
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          overflow-behavior: smooth;
        }

        textarea {
          font-family: inherit;
        }

        textarea::-webkit-scrollbar {
          width: 4px;
        }

        textarea::-webkit-scrollbar-track {
          background: transparent;
        }

        textarea::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 2px;
        }

        div::-webkit-scrollbar {
          width: 4px;
        }

        div::-webkit-scrollbar-track {
          background: transparent;
        }

        div::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 2px;
        }

        @media (max-width: 768px) {
          /* Prevent chat from being pushed off screen on mobile */
          [data-utility-button] {
            width: 60px !important;
            height: 60px !important;
            min-width: 60px !important;
            min-height: 60px !important;
            max-width: 60px !important;
            max-height: 60px !important;
            flex: none !important;
          }

          /* Ensure chat modal stays within viewport and to the right */
          /* The chat window needs to respect viewport bounds */
          body.chat-open {
            overflow: hidden;
          }
        }
      `}</style>
    </>
  );
}