"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";

const THINKING_STATUSES = [
  "Анализирую место…",
  "Изучаю маршруты…",
  "Готовлю советы…",
  "Проверяю детали…",
];

function ThinkingStatus() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % THINKING_STATUSES.length), 2200);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex items-center gap-2 py-0.5">
      <span className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="size-1.5 rounded-full bg-[#233516]/40 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </span>
      <span className="font-sans text-xs text-[#233516]/60 animate-pulse">{THINKING_STATUSES[idx]}</span>
    </div>
  );
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_QUESTIONS = ["Как добраться?", "Что взять с собой?", "Лучший сезон?"];

export default function PlaceChat({ placeId }: { placeId: number }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    setError(null);

    const history = messages.filter((m) => m.content.trim() !== "");

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      await new Promise((r) => setTimeout(r, 2000));
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history, mode: "place", placeId }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error ?? "Ошибка сервера");
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: updated[updated.length - 1].content + chunk,
          };
          return updated;
        });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Гид временно недоступен";
      setError(msg);
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <section className="py-16 px-4 md:px-16">
      <div className="max-w-[1280px] mx-auto">
        <div className="bg-white rounded-2xl shadow-[5px_2px_35px_0px_rgba(84,61,50,0.15)] p-6 md:p-10 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-[#233516] size-10 rounded-full flex items-center justify-center flex-shrink-0">
              <MessageCircle className="size-5 text-[#fffcf3]" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-lg text-[#0e0f11]">Спросите гида</h3>
              <p className="font-sans text-sm text-[#666]">ИИ ответит на вопросы об этом месте</p>
            </div>
          </div>

          {/* Quick questions */}
          {messages.length === 0 && (
            <div className="flex flex-wrap gap-2">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  disabled={loading}
                  className="bg-[#233516]/8 hover:bg-[#233516]/15 border border-[#233516]/15 text-[#233516] font-sans text-sm px-4 py-2 rounded-full transition-colors disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Chat history */}
          {messages.length > 0 && (
            <div className="flex flex-col gap-3 max-h-[360px] overflow-y-auto">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[78%] rounded-2xl px-4 py-3 font-sans text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#233516] text-[#fffcf3] rounded-br-sm"
                        : "bg-[#f5f0e8] text-[#0e0f11] rounded-bl-sm"
                    }`}
                  >
                    {msg.content ? (
                      msg.role === "assistant" ? (
                        <div className="prose prose-sm max-w-none prose-p:my-1 prose-li:my-0 prose-ul:my-1 prose-ol:my-1 prose-strong:font-semibold prose-headings:font-bold prose-headings:mt-2 prose-headings:mb-1">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        msg.content
                      )
                    ) : (
                      <ThinkingStatus />
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-red-500 font-sans text-sm">{error}</p>
          )}

          {/* Input */}
          <div className="flex gap-2 md:gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Задайте вопрос об этом месте..."
              disabled={loading}
              className="flex-1 border border-[#ddd] bg-[#fffcf3] text-[#0e0f11] placeholder:text-[#999] font-sans text-sm md:text-base rounded-xl px-4 md:px-5 py-3 outline-none focus:border-[#233516] transition-colors disabled:opacity-50"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="bg-[#233516] text-[#fffcf3] font-sans font-semibold text-sm md:text-base px-4 md:px-6 py-3 rounded-xl hover:bg-[#1a2811] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 shadow-[4px_5px_20px_0px_rgba(35,53,22,0.25)]"
            >
              {loading ? (
                "…"
              ) : (
                <>
                  <span className="hidden sm:inline">Спросить</span>
                  <Send className="size-4 sm:hidden" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
