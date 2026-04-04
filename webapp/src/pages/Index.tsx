import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatBubble } from "@/components/chat/ChatBubble";
import { ChatEmptyState } from "@/components/chat/ChatEmptyState";
import { ChatInput } from "@/components/chat/ChatInput";
import { CrisisAlert, type CrisisLevel } from "@/components/chat/CrisisAlert";
import { useVoice } from "@/hooks/useVoice";
import { api } from "@/lib/api";
import { useSession, signOut } from "@/lib/auth-client";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

function loadMessages(): Message[] {
  try {
    const saved = localStorage.getItem("chatMessages");
    if (!saved) return [];
    const parsed = JSON.parse(saved) as Array<{ id: string; role: "user" | "assistant"; content: string; timestamp: string }>;
    return parsed.map((m) => ({ ...m, timestamp: new Date(m.timestamp) }));
  } catch {
    return [];
  }
}

// Parse crisis marker from beginning of stream: [[CRISIS:level]]
const CRISIS_REGEX = /^\[\[CRISIS:(concern|high|critical)\]\]/;

const Index = () => {
  const navigate = useNavigate();
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>(loadMessages);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [crisisLevel, setCrisisLevel] = useState<CrisisLevel | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);
  const { voiceEnabled, setVoiceEnabled, lang, setLang, speak, speakChunk, stop, isSpeaking } = useVoice();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load messages from backend on mount
  useEffect(() => {
    api.get<Message[]>("/api/messages").then((msgs) => {
      if (msgs && msgs.length > 0) {
        setMessages(msgs.map((m) => ({ ...m, timestamp: new Date(m.timestamp) })));
        localStorage.removeItem("chatMessages");
      }
      isInitialLoad.current = false;
    }).catch(() => {
      isInitialLoad.current = false;
    });
  }, []);

  // Sync messages to backend (debounced) and localStorage
  useEffect(() => {
    if (isInitialLoad.current) return;
    localStorage.setItem("chatMessages", JSON.stringify(messages));
    const timer = setTimeout(() => {
      api.post("/api/messages", { messages }).catch(() => {});
    }, 1000);
    return () => clearTimeout(timer);
  }, [messages]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    // Stop any ongoing speech when user sends a message
    stop();

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    const assistantId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const baseURL = import.meta.env.VITE_BACKEND_URL || "";
      const response = await fetch(`${baseURL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          messages: updatedMessages.map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to get response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      let spokenUpTo = 0;
      let crisisChecked = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });

        // Check for crisis marker in the first chunk
        if (!crisisChecked) {
          const match = accumulated.match(CRISIS_REGEX);
          if (match) {
            setCrisisLevel(match[1] as CrisisLevel);
            accumulated = accumulated.replace(CRISIS_REGEX, "");
            crisisChecked = true;
          } else if (accumulated.length > 30) {
            // No marker found after enough bytes — no crisis
            crisisChecked = true;
          }
        }

        // Strip marker from display text
        const displayText = crisisChecked ? accumulated : accumulated.replace(CRISIS_REGEX, "");

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: displayText } : m
          )
        );

        // Speak each complete sentence as it arrives
        const completeSentences = displayText.slice(spokenUpTo).match(/[^.!?]+[.!?]+[\s]*/g);
        if (completeSentences) {
          const spoken = completeSentences.join("");
          speakChunk(spoken);
          spokenUpTo += spoken.length;
        }
      }

      // Final cleanup of accumulated text
      const finalText = accumulated.replace(CRISIS_REGEX, "");
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: finalText } : m
        )
      );

      // Speak any trailing text that didn't end with punctuation
      const remainder = finalText.slice(spokenUpTo).trim();
      if (remainder) speakChunk(remainder);
    } catch {
      const errorText = "Sorry, I had trouble responding. Please try again.";
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: errorText } : m
        )
      );
      speak(errorText);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSend() {
    sendMessage(input);
  }

  function handlePromptClick(prompt: string) {
    sendMessage(prompt);
  }

  function handleAnalyze() {
    api.post("/api/messages", { messages }).catch(() => {});
    localStorage.setItem("chatMessages", JSON.stringify(messages));
    navigate("/report", {
      state: {
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      },
    });
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <ChatHeader
        voiceEnabled={voiceEnabled}
        onToggleVoice={() => {
          if (voiceEnabled) stop();
          setVoiceEnabled(!voiceEnabled);
        }}
        lang={lang}
        onChangeLang={setLang}
        isSpeaking={isSpeaking}
        onAnalyze={handleAnalyze}
        messagesCount={messages.length}
        userName={session?.user?.name ?? session?.user?.email ?? undefined}
        onSignOut={() => signOut().then(() => navigate("/login", { replace: true }))}
      />

      <main className="flex-1 pt-14 pb-28 overflow-y-auto">
        {/* Crisis alert banner */}
        {crisisLevel ? (
          <CrisisAlert
            level={crisisLevel}
            onDismiss={() => setCrisisLevel(null)}
          />
        ) : null}

        <div className="max-w-3xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <ChatEmptyState onPromptClick={handlePromptClick} />
          ) : (
            <div className="flex flex-col gap-5">
              {messages.map((message, index) => (
                <ChatBubble
                  key={message.id}
                  message={message}
                  isLatest={index === messages.length - 1}
                  isLoading={isLoading}
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
        isLoading={isLoading}
      />
    </div>
  );
};

export default Index;
