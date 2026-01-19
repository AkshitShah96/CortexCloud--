"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CortexLogo } from "@/components/cortex-logo";
import { Send, Loader2, Sparkles, User, BarChart3, Brain, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

const suggestedQuestions = [
  "What insights can you find from my data?",
  "Summarize the key trends detected",
  "What anomalies should I be aware of?",
  "How do I get started?",
];

export default function AssistantPage() {
  const { token } = useAuth();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [stats, setStats] = useState({ datasets: 0, analyses: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch chat history
  const fetchChatHistory = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/assistant/chat", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages);
        } else {
          // Set initial welcome message
          setMessages([
            {
              id: "welcome",
              role: "assistant",
              content: `Hello! I'm your AI assistant powered by CortexCloud's intelligence engine. I can help you understand your data, explain insights, and answer questions about your analyses.\n\nWhat would you like to know?`,
              createdAt: new Date().toISOString(),
            },
          ]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Fetch user stats
  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setStats({
          datasets: data.stats?.totalDatasets || 0,
          analyses: data.stats?.completedAnalyses || 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  }, [token]);

  useEffect(() => {
    fetchChatHistory();
    fetchStats();
  }, [fetchChatHistory, fetchStats]);

  const sendMessage = async (messageText: string) => {
    if (!token || !messageText.trim() || isSending) return;

    const userMessage: Message = {
      id: "user_" + Date.now(),
      role: "user",
      content: messageText,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsSending(true);

    try {
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: messageText }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          id: data.message.id,
          role: "assistant",
          content: data.response,
          createdAt: data.message.createdAt,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        // Handle error
        const errorMessage: Message = {
          id: "error_" + Date.now(),
          role: "assistant",
          content: "Sorry, I encountered an error processing your request. Please try again.",
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: Message = {
        id: "error_" + Date.now(),
        role: "assistant",
        content: "Network error. Please check your connection and try again.",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isSending) return;

    const currentInput = input;
    setInput("");
    await sendMessage(currentInput);
  };

  const handleSuggestionClick = (question: string) => {
    if (isSending) return;
    sendMessage(question);
  };

  const clearChat = async () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: `Hello! I'm your AI assistant powered by CortexCloud's intelligence engine. I can help you understand your data, explain insights, and answer questions about your analyses.\n\nWhat would you like to know?`,
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-primary" />
            AI Assistant
          </h1>
          <p className="text-muted-foreground mt-1">
            Ask questions about your data and get instant AI-powered answers
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={clearChat} className="gap-2">
          <Trash2 className="w-4 h-4" />
          Clear
        </Button>
      </div>

      {/* Chat Container */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <Avatar className="w-8 h-8 border border-primary/20 shrink-0">
                  <AvatarFallback className="bg-primary/10">
                    <CortexLogo className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-xl px-4 py-3",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-foreground"
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.role === "user" && (
                <Avatar className="w-8 h-8 border border-border shrink-0">
                  <AvatarFallback className="bg-secondary">
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isSending && (
            <div className="flex gap-3">
              <Avatar className="w-8 h-8 border border-primary/20 shrink-0">
                <AvatarFallback className="bg-primary/10">
                  <CortexLogo className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted/50 rounded-xl px-4 py-3">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <div
                    className="w-2 h-2 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {messages.length <= 2 && (
          <div className="px-4 pb-2">
            <p className="text-xs text-muted-foreground mb-2">
              Suggested questions:
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(question)}
                  disabled={isSending}
                  className="text-xs bg-muted/50 hover:bg-muted text-foreground px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your data..."
              className="flex-1 bg-background"
              disabled={isSending}
            />
            <Button type="submit" disabled={!input.trim() || isSending}>
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <BarChart3 className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Datasets</p>
              <p className="text-lg font-bold text-foreground">{stats.datasets}</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-accent/10">
              <Brain className="w-4 h-4 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Analyses</p>
              <p className="text-lg font-bold text-foreground">{stats.analyses}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
