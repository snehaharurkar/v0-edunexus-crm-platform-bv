"use client"

import { useState, useEffect, useRef } from "react"
import { DashboardLayout } from "@/components/shared/dashboard-layout"
import { studentNavItems } from "@/lib/nav-items"
import { Bot, Send, User, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const suggestedQuestions = [
  "Explain React hooks in simple terms",
  "How do I debug a useEffect loop?",
  "What's the difference between props and state?",
  "Help me understand async/await",
]

const mockResponses: Record<string, string> = {
  default: "That's a great question! Let me explain this concept in detail. In software development, understanding the fundamentals is crucial. Would you like me to provide some code examples to illustrate this better?",
  hooks: "React Hooks are functions that let you use state and other React features in functional components. The most common hooks are:\n\n1. **useState** - For managing local state\n2. **useEffect** - For side effects like API calls\n3. **useContext** - For consuming context\n4. **useRef** - For mutable references\n\nWould you like me to show you examples of any specific hook?",
  debug: "Debugging a useEffect infinite loop usually happens when:\n\n1. You forget the dependency array\n2. You include objects/arrays that change on every render\n3. You update state that triggers the effect\n\n**Solution:** Always specify dependencies carefully and use useCallback/useMemo for functions and objects.",
  props: "**Props** are read-only data passed from parent to child components. They're like function arguments.\n\n**State** is mutable data managed within a component using useState or useReducer.\n\nKey difference: Props flow down, state is local. Would you like a code example?",
  async: "**async/await** is syntactic sugar for Promises that makes asynchronous code look synchronous:\n\n```javascript\nasync function fetchData() {\n  try {\n    const response = await fetch('/api/data');\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error(error);\n  }\n}\n```\n\nThe await keyword pauses execution until the Promise resolves.",
}

function getAIResponse(message: string): string {
  const lowerMessage = message.toLowerCase()
  if (lowerMessage.includes("hook")) return mockResponses.hooks
  if (lowerMessage.includes("debug") || lowerMessage.includes("useeffect")) return mockResponses.debug
  if (lowerMessage.includes("props") || lowerMessage.includes("state")) return mockResponses.props
  if (lowerMessage.includes("async") || lowerMessage.includes("await")) return mockResponses.async
  return mockResponses.default
}

export default function AIMentorChat() {
  const [isLoading, setIsLoading] = useState(true)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI Learning Mentor. I'm here to help you with any questions about your courses, coding concepts, or career guidance. What would you like to learn today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate AI thinking
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getAIResponse(input),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsTyping(false)
    }, 1500)
  }

  const handleSuggestedQuestion = (question: string) => {
    setInput(question)
  }

  if (isLoading) {
    return (
      <DashboardLayout navItems={studentNavItems} roleLabel="Student">
        <div className="flex h-[calc(100vh-8rem)] flex-col">
          <Skeleton className="mb-4 h-8 w-48" />
          <Skeleton className="flex-1" />
          <Skeleton className="mt-4 h-14" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout navItems={studentNavItems} roleLabel="Student">
      <div className="flex h-[calc(100vh-8rem)] flex-col">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">AI Learning Mentor</h1>
            <p className="text-sm text-muted-foreground">
              Your personal AI assistant for learning
            </p>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto rounded-xl border bg-card p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                  <p
                    className={`mt-1 text-xs ${
                      message.role === "user"
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-2xl bg-muted px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Suggested Questions */}
        {messages.length <= 2 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedQuestion(question)}
                className="rounded-full border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {question}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="mt-4 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask me anything about your courses..."
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={!input.trim() || isTyping}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
