import { useState, useRef, useEffect } from "react";
import type { ChatMessage } from "../../../backend/src/types";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatBubble } from "@/components/chat/ChatBubble";
import { ChatEmptyState } from "@/components/chat/ChatEmptyState";
import { ChatInput } from "@/components/chat/ChatInput";

const Index = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    const userMessage: ChatMessage = { role: "user", content: trimmed };
    const allMessages: ChatMessage[] = [...messages, userMessage];

    setMessages(allMessages);
    setInput("");
    setIsStreaming(true);

    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL || "";
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: allMessages }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: updated[updated.length - 1].content + chunk,
          };
          return updated;
        });
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  }

  function handleSend() {
    sendMessage(input);
  }

  function handlePromptClick(prompt: string) {
    sendMessage(prompt);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <ChatHeader />

      {/* Message list */}
      <main className="flex-1 pt-14 pb-28 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <ChatEmptyState onPromptClick={handlePromptClick} />
          ) : (
            <div className="flex flex-col gap-5">
              {messages.map((message, index) => (
                <ChatBubble
                  key={index}
                  message={message}
                  isLatest={index === messages.length - 1}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      <ChatInput
        value={input}
        onChange={setInput}
        onSend={handleSend}
        isStreaming={isStreaming}
      />
    </div>
  );
};

export default Index;
