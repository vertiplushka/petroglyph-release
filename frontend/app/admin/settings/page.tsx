"use client";

import { useEffect, useRef, useState } from "react";
import { getAISettings, updateAISettings, AISettings } from "@/lib/admin-api";
import { Eye, EyeOff, Save, RotateCcw, CheckCircle, AlertCircle, Send, Trash2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

const TEST_PROMPTS = [
  "Привет! Ты работаешь?",
  "Порекомендуй маршрут на 3 дня",
  "Какие отели есть в регионе?",
];

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  ms?: number;
}

function ThinkingDots() {
  return (
    <span className="flex gap-0.5 items-center h-4">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 rounded-full bg-[#233516]/40 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

export default function SettingsPage() {
  // ── Settings state ──────────────────────────────────────────────────────────
  const [settings,    setSettings]    = useState<AISettings | null>(null);
  const [baseUrl,     setBaseUrl]     = useState("");
  const [model,       setModel]       = useState("claude-haiku-4-5");
  const [apiKey,      setApiKey]      = useState("");
  const [showKey,     setShowKey]     = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [status,      setStatus]      = useState<"idle" | "saved" | "error">("idle");
  const [errorMsg,    setErrorMsg]    = useState("");

  // ── Chat state ──────────────────────────────────────────────────────────────
  const [messages,    setMessages]    = useState<ChatMessage[]>([]);
  const [chatInput,   setChatInput]   = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError,   setChatError]   = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getAISettings()
      .then((s) => {
        setSettings(s);
        setBaseUrl(s.baseUrl);
        setModel(s.model);
      })
      .catch(() => setErrorMsg("Не удалось загрузить настройки"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSave() {
    setSaving(true);
    setStatus("idle");
    try {
      const payload: Parameters<typeof updateAISettings>[0] = { baseUrl, model };
      if (apiKey.trim()) payload.apiKey = apiKey.trim();
      const updated = await updateAISettings(payload);
      setSettings(updated);
      setApiKey("");
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Ошибка сохранения");
      setStatus("error");
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    if (!settings) return;
    setBaseUrl(settings.baseUrl);
    setModel(settings.model);
    setApiKey("");
    setStatus("idle");
  }

  async function sendChat(text: string) {
    if (!text.trim() || chatLoading) return;
    setChatError(null);
    setChatInput("");

    const history = messages.map(({ role, content }) => ({ role, content }));
    const t0 = Date.now();

    setMessages((prev) => [
      ...prev,
      { role: "user", content: text },
      { role: "assistant", content: "" },
    ]);
    setChatLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history, mode: "planner" }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Ошибка сервера");
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          updated[updated.length - 1] = { ...last, content: last.content + chunk };
          return updated;
        });
      }

      const ms = Date.now() - t0;
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { ...updated[updated.length - 1], ms };
        return updated;
      });
    } catch (e) {
      setChatError(e instanceof Error ? e.message : "Ошибка");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setChatLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse space-y-4 max-w-2xl">
          <div className="h-8 bg-[#ede9de] rounded w-48" />
          <div className="h-48 bg-[#ede9de] rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-[#0e0f11] text-[1.85rem] font-semibold leading-tight">Настройки ИИ</h1>
          <p className="text-[#888] text-sm mt-1.5">API-ключ, модель и базовый URL</p>
        </div>
      </div>

      <div className="max-w-2xl flex flex-col gap-0">

      {/* ── Config form ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#e8e4d8] shadow-sm p-6 md:p-8 flex flex-col gap-6">

        {/* Base URL */}
        <div className="flex flex-col gap-2">
          <label className="font-sans text-sm font-semibold text-[#0e0f11]">Базовый URL API</label>
          <input
            type="url"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://api.anthropic.com/v1"
            className="w-full rounded-xl border border-[#e0dbd0] bg-[#fafaf8] px-4 py-3 font-sans text-sm text-[#0e0f11] placeholder:text-[#bbb] outline-none focus:border-[#233516] focus:ring-2 focus:ring-[#233516]/10 transition"
          />
          <p className="font-sans text-xs text-[#999]">
            Anthropic: <code className="bg-[#f0ece0] px-1 py-0.5 rounded text-[#555]">https://api.anthropic.com/v1</code>
          </p>
        </div>

        {/* Model */}
        <div className="flex flex-col gap-2">
          <label className="font-sans text-sm font-semibold text-[#0e0f11]">Модель</label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="claude-haiku-4-5"
            className="w-full rounded-xl border border-[#e0dbd0] bg-[#fafaf8] px-4 py-3 font-sans text-sm text-[#0e0f11] placeholder:text-[#bbb] outline-none focus:border-[#233516] focus:ring-2 focus:ring-[#233516]/10 transition font-mono"
          />
          <p className="font-sans text-xs text-[#999]">
            Например: <code className="bg-[#f0ece0] px-1 py-0.5 rounded text-[#555]">haiku-4.5</code> или <code className="bg-[#f0ece0] px-1 py-0.5 rounded text-[#555]">claude-sonnet-4-6</code>
          </p>
        </div>

        {/* API Key */}
        <div className="flex flex-col gap-2">
          <label className="font-sans text-sm font-semibold text-[#0e0f11]">API-ключ</label>
          {settings?.hasKey && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 mb-1">
              <CheckCircle size={14} className="text-emerald-600 flex-shrink-0" />
              <p className="font-sans text-xs text-emerald-700">
                Ключ установлен: <span className="font-mono">{settings.apiKeyMasked}</span>
              </p>
            </div>
          )}
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={settings?.hasKey ? "Введите новый ключ для замены" : "sk-ant-…"}
              className="w-full rounded-xl border border-[#e0dbd0] bg-[#fafaf8] px-4 py-3 pr-11 font-sans text-sm text-[#0e0f11] placeholder:text-[#bbb] outline-none focus:border-[#233516] focus:ring-2 focus:ring-[#233516]/10 transition font-mono"
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#bbb] hover:text-[#555] transition"
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="font-sans text-xs text-[#999]">Оставьте пустым, чтобы не менять текущий ключ.</p>
        </div>

        {/* Status banner */}
        {status === "saved" && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
            <p className="font-sans text-sm text-emerald-700 font-medium">Настройки сохранены</p>
          </div>
        )}
        {status === "error" && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
            <p className="font-sans text-sm text-red-600">{errorMsg}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl font-sans text-sm font-semibold transition-all",
              "bg-[#233516] text-[#fffcf3] hover:bg-[#1a2811] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            )}
          >
            <Save size={15} />
            {saving ? "Сохранение…" : "Сохранить"}
          </button>
          <button
            onClick={handleReset}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-3 rounded-xl font-sans text-sm text-[#666] hover:text-[#0e0f11] hover:bg-[#f0ece0] transition-all disabled:opacity-50"
          >
            <RotateCcw size={15} />
            Сбросить
          </button>
        </div>
      </div>

      {/* ── Test chat ─────────────────────────────────────────────────────────── */}
      <div className="mt-6 bg-white rounded-2xl border border-[#e8e4d8] shadow-sm overflow-hidden">
        {/* Chat header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0ece0]">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-[#233516]/10 flex items-center justify-center">
              <Zap size={15} className="text-[#233516]" />
            </div>
            <div>
              <p className="font-sans text-sm font-semibold text-[#0e0f11]">Тест ИИ</p>
              <p className="font-sans text-xs text-[#999]">Проверка соединения с API</p>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={() => { setMessages([]); setChatError(null); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-sans text-xs text-[#999] hover:text-[#555] hover:bg-[#f5f0e8] transition-all"
            >
              <Trash2 size={12} />
              Очистить
            </button>
          )}
        </div>

        {/* Quick prompts */}
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 px-6 pt-4 pb-2">
            {TEST_PROMPTS.map((q) => (
              <button
                key={q}
                onClick={() => sendChat(q)}
                disabled={chatLoading}
                className="bg-[#f5f0e8] hover:bg-[#ede6d8] border border-[#e8e2d4] text-[#233516] font-sans text-xs px-3.5 py-2 rounded-full transition-colors disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Messages */}
        {messages.length > 0 && (
          <div className="flex flex-col gap-3 px-6 py-4 max-h-[380px] overflow-y-auto">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={cn(
                    "max-w-[82%] rounded-2xl px-4 py-3 font-sans text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-[#233516] text-[#fffcf3] rounded-br-sm"
                      : "bg-[#f5f0e8] text-[#0e0f11] rounded-bl-sm"
                  )}
                >
                  {msg.content ? (
                    msg.role === "assistant" ? (
                      <>
                        <div className="prose prose-sm max-w-none prose-p:my-1 prose-li:my-0 prose-ul:my-1 prose-ol:my-1 prose-strong:font-semibold prose-headings:font-bold prose-headings:mt-2 prose-headings:mb-1">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                        {msg.ms != null && (
                          <p className="mt-2 text-[10px] text-[#233516]/40 font-mono">{(msg.ms / 1000).toFixed(1)}с</p>
                        )}
                      </>
                    ) : (
                      msg.content
                    )
                  ) : (
                    <ThinkingDots />
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Error */}
        {chatError && (
          <div className="mx-6 mb-3 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
            <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
            <p className="font-sans text-xs text-red-600">{chatError}</p>
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2 px-6 py-4 border-t border-[#f0ece0]">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(chatInput); } }}
            placeholder="Напишите тестовый запрос…"
            disabled={chatLoading}
            className="flex-1 rounded-xl border border-[#e0dbd0] bg-[#fafaf8] px-4 py-2.5 font-sans text-sm text-[#0e0f11] placeholder:text-[#bbb] outline-none focus:border-[#233516] focus:ring-2 focus:ring-[#233516]/10 transition disabled:opacity-50"
          />
          <button
            onClick={() => sendChat(chatInput)}
            disabled={chatLoading || !chatInput.trim()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#233516] text-[#fffcf3] font-sans text-sm font-semibold hover:bg-[#1a2811] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            <Send size={14} />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 bg-[#fffdf8] border border-[#e8e4d8] rounded-2xl p-5">
        <p className="font-sans text-xs font-semibold text-[#0e0f11] mb-2">Как это работает</p>
        <ul className="font-sans text-xs text-[#666] space-y-1.5 list-disc ml-4">
          <li>Настройки хранятся в базе данных, а не в конфиге сервера.</li>
          <li>Изменения вступают в силу в течение 30 секунд без перезапуска.</li>
          <li>API-ключ передаётся только внутри серверной сети — браузер его не видит.</li>
          <li>Если поле ключа пустое при сохранении — текущий ключ не изменится.</li>
        </ul>
      </div>
      </div>
    </div>
  );
}
