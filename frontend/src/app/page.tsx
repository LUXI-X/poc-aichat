"use client";

import { useState, useRef, useEffect } from "react";
import { Menu, X, Plus, LogOut, MessageCircle, Trash2 } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "guest";
  content: string;
  timestamp: Date;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  date: string;
}

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

function getToday() {
  return new Date().toLocaleDateString("en-US", { 
    year: "numeric", 
    month: "short", 
    day: "2-digit" 
  });
}

function getTodayShort() {
  const today = new Date();
  const day = today.getDate().toString().padStart(2, '0');
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  return `${month}/${day}`;
}

function renderMessage(content: string) {
  // Split by newlines and render as lines
  const lines = content.split('\n');
  return lines.map((line, idx) => (
    <div key={idx} className="whitespace-pre-wrap wrap-break-word">
      {line || <br />}
    </div>
  ));
}

export default function Page() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [guestName] = useState("Guest User");
  const [selectedMode, setSelectedMode] = useState<"chat" | "task" | "todo" | "summary" | "project">("chat");
  const [showMentions, setShowMentions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("chats");
      if (saved) {
        const parsed = JSON.parse(saved) as Chat[];
        // Convert date strings back to Date objects
        const restored = parsed.map(c => ({
          ...c,
          createdAt: new Date(c.createdAt),
          messages: c.messages.map(m => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }))
        }));
        setChats(restored);
        if (restored.length > 0) setActiveChat(restored[0].id);
      }
    } catch (e) {
      console.error("Failed to load chats:", e);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem("chats", JSON.stringify(chats));
    }
  }, [chats]);

  // Auto scroll messages
  useEffect(() => {
    if (messagesContainerRef.current) {
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      }, 0);
    }
  }, [chats, activeChat]);

  const currentChat = chats.find(c => c.id === activeChat);

  function newChat() {
    const chat: Chat = {
      id: generateId(),
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
      date: getToday(),
    };
    setChats(prev => [chat, ...prev]);
    setActiveChat(chat.id);
  }

  async function sendMessage() {
    if (!input.trim() || !activeChat) return;

    const userText = input.trim();
    const newMsg: Message = {
      id: generateId(),
      role: "user",
      content: `${selectedMode !== "chat" ? `@${selectedMode} ` : ""}${userText}`,
      timestamp: new Date(),
    };

    setChats(prev =>
      prev.map(c => {
        if (c.id === activeChat) {
          return {
            ...c,
            messages: [...c.messages, newMsg],
            title: c.messages.length === 0 ? userText.slice(0, 40) : c.title,
          };
        }
        return c;
      })
    );

    setInput("");
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    // Call backend API based on mode
    try {
      let endpoint = "http://localhost:8000/generate";
      if (selectedMode === "task" || selectedMode === "todo") {
        endpoint = "http://localhost:8000/generate-todo";
      } else if (selectedMode === "summary") {
        endpoint = "http://localhost:8000/generate-summary";
      } else if (selectedMode === "project") {
        endpoint = "http://localhost:8000/generate-action";
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userText }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      let aiContent = "";
      if (selectedMode === "task" || selectedMode === "todo") {
        // Format tasks as readable list
        if (data.tasks && Array.isArray(data.tasks)) {
          aiContent = "📋 **Tasks Generated:**\n" + 
            data.tasks.map((t: any) => `• ${t.title} (${t.priority})`).join("\n");
        }
      } else if (selectedMode === "summary") {
        aiContent = `📝 **Summary:**\n${data.summary || "No summary generated"}`;
      } else if (selectedMode === "project") {
        aiContent = `⚡ **Next Action:**\n${data.next_action || "No action suggested"}`;
      } else {
        aiContent = data.reply || "No response received";
      }

      const aiResponse: Message = {
        id: generateId(),
        role: "guest",
        content: aiContent,
        timestamp: new Date(),
      };

      setChats(prev =>
        prev.map(c =>
          c.id === activeChat
            ? { ...c, messages: [...c.messages, aiResponse] }
            : c
        )
      );
    } catch (e) {
      console.error("Backend error:", e);
      const errorMsg: Message = {
        id: generateId(),
        role: "guest",
        content: "❌ Error connecting to AI. Please try again.",
        timestamp: new Date(),
      };

      setChats(prev =>
        prev.map(c =>
          c.id === activeChat
            ? { ...c, messages: [...c.messages, errorMsg] }
            : c
        )
      );
    }
  }

  function deleteChat(id: string) {
    setChats(prev => prev.filter(c => c.id !== id));
    if (activeChat === id) {
      const remaining = chats.filter(c => c.id !== id);
      setActiveChat(remaining.length > 0 ? remaining[0].id : null);
    }
  }

  function logout() {
    // Clear all data
    setChats([]);
    setActiveChat(null);
    localStorage.removeItem("chats");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    
    // Check for @ mentions
    if (e.target.value.includes("@")) {
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
    
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
  }

  // Group chats by date
  const groupedChats: Record<string, Chat[]> = {};
  chats.forEach(chat => {
    const date = new Date(chat.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
    if (!groupedChats[date]) groupedChats[date] = [];
    groupedChats[date].push(chat);
  });

  const sortedDates = Object.keys(groupedChats).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex overflow-hidden">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed lg:static lg:translate-x-0 left-0 top-0 h-screen w-64 bg-slate-950/80 backdrop-blur-xl border-r border-purple-500/20 flex flex-col transition-transform duration-300 z-40 overflow-hidden`}
      >
        {/* Header with New Chat */}
        <div className="shrink-0 p-4 border-b border-purple-500/10">
          <button
            onClick={newChat}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
          >
            <Plus size={18} />
            <span>New Chat</span>
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 min-h-0 overflow-y-auto px-3 py-4 space-y-4">
          {sortedDates.length === 0 ? (
            <div className="text-center py-8 text-purple-300/60">
              <MessageCircle size={32} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm">No chats yet</p>
              <p className="text-xs mt-1">Start a new chat to begin</p>
            </div>
          ) : (
            sortedDates.map(date => (
              <div key={date}>
                <h3 className="text-xs font-semibold text-purple-300/60 uppercase tracking-wider mb-2 pl-2">
                  {date}
                </h3>
                <div className="space-y-1">
                  {groupedChats[date].map(chat => (
                    <div
                      key={chat.id}
                      className={`group relative flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-all ${
                        activeChat === chat.id
                          ? "bg-purple-600/40 border border-purple-500/50"
                          : "hover:bg-purple-500/10 border border-transparent"
                      }`}
                      onClick={() => {
                        setActiveChat(chat.id);
                        setSidebarOpen(false);
                      }}
                    >
                      <MessageCircle size={16} className="shrink-0 text-purple-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate text-purple-100/90">
                          {chat.title}
                        </p>
                        <p className="text-xs text-purple-300/40">
                          {chat.messages.length} messages
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChat(chat.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-red-400/60 hover:text-red-400 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* User Profile & Logout */}
        <div className="shrink-0 border-t border-purple-500/10 p-4 space-y-2">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-purple-500/5">
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-purple-400 to-blue-500 flex items-center justify-center text-sm font-bold shrink-0">
              G
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{guestName}</p>
              <p className="text-xs text-purple-300/60">Guest</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-200 hover:text-red-100 font-medium py-2 px-3 rounded-lg transition-colors text-sm"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden h-screen">
        {/* Top Bar */}
        <div className="shrink-0 border-b border-purple-500/10 bg-slate-950/40 backdrop-blur-sm px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-purple-500/10 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div>
                <h2 className="text-lg font-semibold">
                  {currentChat ? currentChat.title : "Select a chat"}
                </h2>
                <p className="text-xs text-purple-300/60">
                  {currentChat ? `${currentChat.messages.length} messages` : ""}
                </p>
              </div>
            </div>
            <div className="text-sm text-purple-300/60">{getTodayShort()}</div>
          </div>

          {/* Category Buttons */}
          {currentChat && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[
                { id: "chat", label: "💬 Chat", icon: "chat" },
                { id: "task", label: "✅ Task", icon: "task" },
                { id: "todo", label: "📋 Todo", icon: "todo" },
                { id: "summary", label: "📝 Summary", icon: "summary" },
                { id: "project", label: "⚡ Project", icon: "project" },
              ].map((mode: any) => (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                    selectedMode === mode.id
                      ? "bg-purple-600 text-white"
                      : "bg-purple-500/20 text-purple-200 hover:bg-purple-500/30"
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Messages Area */}
        <div ref={messagesContainerRef} className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-6 space-y-4 scroll-smooth">
          {!currentChat ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <MessageCircle size={48} className="mx-auto mb-4 text-purple-400/50" />
                <h3 className="text-xl font-semibold mb-2">Welcome to Chat</h3>
                <p className="text-purple-300/60">Select a chat or create a new one to start</p>
              </div>
            </div>
          ) : currentChat.messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <MessageCircle size={48} className="mx-auto mb-4 text-purple-400/50" />
                <h3 className="text-xl font-semibold mb-2">Start the conversation</h3>
                <p className="text-purple-300/60">Send your first message to begin</p>
              </div>
            </div>
          ) : (
            currentChat.messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-2xl px-4 py-2 rounded-lg ${
                    msg.role === "user"
                      ? "bg-purple-600/80 text-white rounded-br-none"
                      : "bg-slate-800/60 text-slate-100 rounded-bl-none border border-purple-500/20"
                  }`}
                >
                  <div className="text-sm sm:text-base leading-relaxed">
                    {renderMessage(msg.content)}
                  </div>
                  <p className={`text-xs mt-1 ${
                    msg.role === "user"
                      ? "text-purple-200/60"
                      : "text-slate-400/60"
                  }`}>
                    {msg.timestamp.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {currentChat && (
          <div className="shrink-0 border-t border-purple-500/10 bg-slate-950/40 backdrop-blur-sm px-4 sm:px-6 py-4 relative">
            {/* Mention Suggestions */}
            {showMentions && (
              <div className="absolute bottom-full left-4 right-4 mb-2 bg-slate-800/95 border border-purple-500/30 rounded-lg p-2 z-50">
                <div className="text-xs text-purple-300/60 uppercase tracking-wider font-semibold mb-2">Suggestions</div>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {[
                    { mention: "@chat", label: "💬 Chat - General conversation" },
                    { mention: "@task", label: "✅ Task - Generate tasks" },
                    { mention: "@todo", label: "📋 Todo - Create todo list" },
                    { mention: "@summary", label: "📝 Summary - Summarize project" },
                    { mention: "@project", label: "⚡ Project - Next action" },
                  ].map((item) => (
                    <button
                      key={item.mention}
                      onClick={() => {
                        setInput(`${item.mention} `);
                        setShowMentions(false);
                        inputRef.current?.focus();
                      }}
                      className="w-full text-left px-3 py-2 text-sm rounded hover:bg-purple-500/20 transition-colors text-purple-200"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex gap-3 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={
                  selectedMode === "task" || selectedMode === "todo" ? "Describe what tasks to generate..." :
                  selectedMode === "summary" ? "What would you like summarized?" :
                  selectedMode === "project" ? "Ask for the next action..." :
                  "Type your message..."
                }
                rows={1}
                className="flex-1 bg-slate-800/50 border border-purple-500/20 rounded-lg px-4 py-2.5 text-white placeholder-purple-300/40 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 resize-none max-h-24 text-sm sm:text-base"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/40 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 sm:px-6 rounded-lg transition-colors text-sm"
              >
                Send
              </button>
            </div>
            <p className="text-xs text-purple-300/40 mt-2">
              {selectedMode !== "chat" && `Mode: ${selectedMode.toUpperCase()} • `}
              Shift + Enter for new line
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
