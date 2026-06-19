"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Banknote, MapPin, Clock, MessageCircle, Bot, Send, Maximize2, Minimize2, Trash2, AlertCircle, Heart } from "lucide-react";
import ReactMarkdown from "react-markdown";
import AltaiMap from "./altai-map";
import type { Place } from "@/lib/server-api";
import { getUserToken } from "@/lib/user-auth";

interface Message { role: "user" | "assistant"; content: string }
interface Variant  { label: string; ids: number[] }

const QUICK_QUESTIONS = [
  "Хочу к озёрам",
  "Активный отдых в горах",
  "Тихий отдых без толпы",
  "Что посмотреть за 3 дня?",
];

const LS_KEY = "petroglyph_chat_v1";

// ─── Inline quiz widget ────────────────────────────────────────────────────

const QUIZ_CONFIG: Record<string, { label: string; type: "single" | "multi"; options: string[] }> = {
  duration:  { label: "Сколько дней?",     type: "single", options: ["1–2 дня", "3–4 дня", "5–7 дней", "10+ дней"] },
  transport: { label: "Транспорт?",        type: "single", options: ["Своя машина", "Аренда авто", "Организованный тур", "Общественный транспорт"] },
  interests: { label: "Что интересует?",   type: "multi",  options: ["Природа и пейзажи", "Горы и треккинг", "Озёра и реки", "История и культура", "Активный отдых", "Тихий отдых"] },
  season:    { label: "Сезон поездки?",    type: "single", options: ["Лето", "Осень", "Зима", "Весна"] },
  group:     { label: "С кем едете?",      type: "single", options: ["Один / одна", "Вдвоём", "С семьёй", "Компания друзей"] },
};

const QUIZ_MARKER = /<<QUIZ:([\w,]+)>>/;

function looksLikeClarifyingQuestion(text: string): boolean {
  const lower = text.toLowerCase();
  // Ответ заканчивается вопросом И содержит ключевые слова о параметрах поездки
  const endsWithQuestion = lower.trimEnd().endsWith("?");
  const hasParamKeywords = /сколько дней|сколько времени|есть ли (своя )?машина|какой транспорт|что интересует|какой сезон|с кем едете|состав|бюджет/.test(lower);
  return endsWithQuestion && hasParamKeywords;
}

function parseQuizMarker(text: string): { fields: string[]; clean: string } | null {
  const m = text.match(QUIZ_MARKER);
  if (!m) return null;
  const fields = m[1].split(",").map(s => s.trim()).filter(f => f in QUIZ_CONFIG);
  const clean = text.replace(QUIZ_MARKER, "").trimEnd();
  return fields.length > 0 ? { fields, clean } : null;
}

function parseQuizAnswer(values: Record<string, string | string[]>): string {
  const parts = Object.entries(values)
    .filter(([, v]) => (Array.isArray(v) ? v.length > 0 : v !== ""))
    .map(([k, v]) => {
      const label = QUIZ_CONFIG[k]?.label.replace("?", "") ?? k;
      const val = Array.isArray(v) ? v.join(", ") : v;
      return `${label}: ${val}`;
    });
  return parts.length > 0 ? parts.join(". ") + "." : "Без конкретных предпочтений.";
}

// ─── NLU: extract quiz fields from first message ─────────────────────────────

interface ExtractedQuiz {
  /** Fields NOT found in the text — should be asked in the quiz */
  missing: string[];
  /** Values already detected — will be pre-filled */
  prefilled: Record<string, string | string[]>;
  /** Original text with detected field mentions stripped for a cleaner API prompt */
  cleaned: string;
}

const DURATION_RE = /\b(\d[-\–]\d|\d+)\s*дн(я|ей|ю|у)?\b/i;
const TRANSPORT_RE = /\b(сво[яю]\s*машин[аеу]|аренд[ау]\s*авто|организованн?([ау]й|ого)\s*тур|общественн?([ау]й|ого)\s*транспорт|автобус|поезд)\b/i;
const INTERESTS_RE = {
  "Природа и пейзажи": /природ[ауы]|(пейзаж|виды?)\b/i,
  "Горы и треккинг":    /гор[аы]|(треккинг|поход)\b/i,
  "Озёра и реки":       /(озёр|озера|озеро|рек[ау])\b/i,
  "История и культура": /(истор[ия]|культур[ау])\b/i,
  "Активный отдых":     /(активн?([ау]й|ого)\s*отдых|рафтинг|сплав|конь?к\b)/i,
  "Тихий отдых":        /(тих(ий|ого)|спокойн?([ау]й|ого)|расслаб)\b/i,
};
const GROUP_RE = {
  "Один / одна":         /^(один|одна|одиночк|сам(а|о))\b/i,
  "Вдвоём":              /^(вдво[её]|пар[ау]?)\b/i,
  "С семьёй":             /(семь[яей]|с\s*ребенк|детьми?|ребенок)\b/i,
  "Компания друзей":      /(компан|друзь[яей]|групп[ауы]|команд)\b/i,
};

function extractQuizFromText(text: string): ExtractedQuiz {
  const lower = text.toLowerCase();

  const duration  = (() => {
    const m = text.match(DURATION_RE);
    if (!m) return "";
    const num = parseInt(m[1].replace(/\D/g, ""), 10);
    if (num <= 2)  return "1–2 дня";
    if (num <= 4)  return "3–4 дня";
    if (num <= 7)  return "5–7 дней";
    return "10+ дней";
  })();

  const transport = TRANSPORT_RE.test(lower) ? (() => {
    if (/сво[яю]\s*машин/.test(lower)) return "Своя машина";
    if (/аренд[ау]\s*авто/.test(lower)) return "Аренда авто";
    if (/организованн?([ау]й|ого)\s*тур/.test(lower)) return "Организованный тур";
    if (/общественн?([ау]й|ого)\s*транспорт/.test(lower)) return "Общественный транспорт";
    return "Своя машина";
  })() : "";

  const interests: string[] = Object.entries(INTERESTS_RE)
    .filter(([, re]) => re.test(lower))
    .map(([label]) => label);

  const group = (() => {
    for (const [label, re] of Object.entries(GROUP_RE)) {
      if (re.test(lower.trim())) return label;
    }
    return "";
  })();

  const prefilled: Record<string, string | string[]> = {};
  const missing: string[] = [];

  // duration
  if (duration) prefilled.duration = duration;
  else missing.push("duration");

  // transport
  if (transport) prefilled.transport = transport;
  else missing.push("transport");

  // interests — always ask if nothing found (multi-select has no partial skip)
  if (interests.length > 0) prefilled.interests = interests;
  else missing.push("interests");

  // group
  if (group) prefilled.group = group;
  else missing.push("group");

  // Build cleaned message: strip field mentions so AI doesn't hallucinate them
  let cleaned = text
    .replace(DURATION_RE, "")
    .replace(TRANSPORT_RE, "")
    .replace(/\b(?:один|одна|одиночк|вдво[её]|пар[ау]?|сам[ао])\b/gi, "")
    .replace(/(?:семь[яей]|с\s*ребенк|детьми?|ребенок|компан|друзь[яей]|групп[ауы]|команд)\b/gi, "")
    .replace(/(?:активн?([ау]й|ого)\s*отдых|рафтинг|расслаб|тих(ий|ого)|спокойн?([ау]й|ого))\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  if (!cleaned) cleaned = text.trim();

  return { missing, prefilled, cleaned };
}

const QUIZ_THINKING = [
  "Анализирую предпочтения…",
  "Подбираю подходящие места…",
  "Составляю маршрут…",
];

function InlineQuiz({ fields, prefilled, onSubmit }: { fields: string[]; prefilled?: Record<string, string | string[]>; onSubmit: (text: string) => void }) {
  const [values, setValues] = useState<Record<string, string | string[]>>(() =>
    Object.fromEntries(
      fields.map((f) => [f, prefilled?.[f] ?? (QUIZ_CONFIG[f]?.type === "multi" ? [] : "")])
    )
  );
  const [thinking, setThinking] = useState(false);
  const [thinkIdx, setThinkIdx]  = useState(0);

  useEffect(() => {
    if (!thinking) return;
    const t = setInterval(() => setThinkIdx(i => (i + 1) % QUIZ_THINKING.length), 800);
    return () => clearInterval(t);
  }, [thinking]);

  function toggle(field: string, option: string) {
    setValues(prev => {
      const cur = prev[field];
      if (Array.isArray(cur)) {
        return { ...prev, [field]: cur.includes(option) ? cur.filter(x => x !== option) : [...cur, option] };
      }
      return { ...prev, [field]: cur === option ? "" : option };
    });
  }

  function handleSubmit(text: string) {
    setThinking(true);
    setTimeout(() => onSubmit(text), 1600);
  }

  const hasAny = Object.values(values).some(v => Array.isArray(v) ? v.length > 0 : v !== "");

  if (thinking) {
    return (
      <div className="mt-2 bg-white border border-[#e8e2d6] rounded-2xl px-4 py-5 flex items-center gap-3 shadow-sm">
        <span className="flex gap-0.5">
          {[0, 1, 2].map(i => (
            <span key={i} className="size-2 rounded-full bg-[#233516]/40 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </span>
        <span className="font-sans text-sm text-[#233516]/70 animate-pulse">{QUIZ_THINKING[thinkIdx]}</span>
      </div>
    );
  }

  return (
    <div className="mt-2 bg-white border border-[#e8e2d6] rounded-2xl p-4 flex flex-col gap-3 shadow-sm">
      {fields.map(field => {
        const cfg = QUIZ_CONFIG[field];
        if (!cfg) return null;
        const val = values[field];
        return (
          <div key={field}>
            <p className="font-sans text-xs font-semibold text-[#233516]/60 uppercase tracking-wider mb-1.5">{cfg.label}</p>
            <div className="flex flex-wrap gap-1.5">
              {cfg.options.map(opt => {
                const selected = Array.isArray(val) ? val.includes(opt) : val === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => toggle(field, opt)}
                    className={`px-3 py-1.5 rounded-full border text-xs font-sans transition-all ${
                      selected
                        ? "bg-[#233516] border-[#233516] text-[#fffcf3]"
                        : "border-[#233516]/25 text-[#233516] hover:border-[#233516]/60 hover:bg-[#233516]/5"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => handleSubmit(parseQuizAnswer(values))}
          className="flex-1 bg-[#233516] text-[#fffcf3] font-sans font-semibold text-sm py-2.5 rounded-xl hover:bg-[#1a2811] transition-colors"
        >
          Подобрать маршрут
        </button>
        {!hasAny && (
          <button
            onClick={() => handleSubmit("Без конкретных предпочтений, предложи лучший вариант.")}
            className="font-sans text-xs text-[#233516]/50 hover:text-[#233516] transition-colors px-2"
          >
            Пропустить
          </button>
        )}
      </div>
    </div>
  );
}

// ─── helpers ───────────────────────────────────────────────────────────────

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function parsePrice(s: string) { return parseInt(s.replace(/\D/g, ""), 10) || 0; }

// Nearest-neighbor greedy TSP — minimises total route distance
function sortByNearestNeighbor(ids: number[], places: Place[]): number[] {
  if (ids.length <= 2) return ids;
  const pts = ids.map((id) => places.find((p) => p.id === id)).filter(Boolean) as Place[];
  const visited = new Set<number>();
  const result: number[] = [];

  // Start from northernmost point (typically the entry to the region)
  const start = pts.reduce((a, b) => (a.lat > b.lat ? a : b));
  result.push(start.id);
  visited.add(start.id);

  while (result.length < pts.length) {
    const last = pts.find((p) => p.id === result[result.length - 1])!;
    let nearest: (typeof pts)[0] | null = null;
    let minDist = Infinity;
    for (const p of pts) {
      if (visited.has(p.id)) continue;
      const d = haversineKm(last.lat, last.lng, p.lat, p.lng);
      if (d < minDist) { minDist = d; nearest = p; }
    }
    if (nearest) { result.push(nearest.id); visited.add(nearest.id); }
  }
  return result;
}

function detectPlaces(text: string, places: Place[]): number[] {
  const found: number[] = [];
  const lower = text.toLowerCase();
  // Only attractions define the route — hotels/restaurants/museums cause the spider-web
  const attractions = places.filter((p) => !p.type || p.type === "attraction");
  for (const p of attractions) {
    if (found.includes(p.id)) continue;
    const nameLower = p.name.toLowerCase();
    if (lower.includes(nameLower)) { found.push(p.id); continue; }
    // Stem match — handles declined Russian forms ("Чуйского тракта" → "Чуйский тракт")
    const words = nameLower.split(/\s+/).filter(w => w.length >= 5);
    if (words.length > 0 && words.some(w => lower.includes(w.slice(0, Math.max(4, w.length - 2))))) {
      found.push(p.id);
    }
  }
  return found;
}

function parseVariants(text: string, places: Place[]): Variant[] {
  // Split on "Вариант N" — separator after the number is optional
  const parts = text.split(/(?=Вариант\s+\d+)/i);
  return parts
    .filter((p) => /^Вариант\s+\d+/i.test(p.trim()))
    .map((section) => {
      const m = section.match(/^Вариант\s+\d+[^\n]*/i);
      return { label: m ? m[0].replace(/[*_]/g, "").trim() : "", ids: detectPlaces(section, places) };
    })
    .filter((v) => v.ids.length > 0);
}

// ─── sub-components ────────────────────────────────────────────────────────

const THINKING_STATUSES = [
  "Анализирую запрос…",
  "Изучаю карту Алтая…",
  "Подбираю маршрут…",
  "Рассчитываю путь…",
  "Составляю рекомендации…",
  "Проверяю логистику…",
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


function RouteStats({ ids, places }: { ids: number[]; places: Place[] }) {
  const pts = places.filter((p) => ids.includes(p.id));
  const cost = pts.reduce((s, p) => s + parsePrice(p.price), 0);
  let km = 0;
  for (let i = 1; i < pts.length; i++)
    km += haversineKm(pts[i - 1].lat, pts[i - 1].lng, pts[i].lat, pts[i].lng);
  const hours = Math.round(km / 55);

  return (
    <>
      {/* Top-right: distance + time */}
      {km > 0 && (
        <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-[#e8e2d6] px-3 py-2 md:px-4 md:py-3 flex flex-col gap-1.5 md:gap-2 pointer-events-none z-[1000]">
          <Stat icon={<MapPin className="size-3.5 md:size-4 text-[#233516]" />} label="Расстояние" value={`~${Math.round(km)} км`} />
          <div className="w-full h-px bg-[#f0ebe0]" />
          <Stat icon={<Clock className="size-3.5 md:size-4 text-[#233516]" />} label="В пути" value={`~${hours} ч`} />
        </div>
      )}

      {/* Bottom-right: cost + detail button */}
      <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-[#e8e2d6] p-2 md:p-3 flex gap-2 z-[1000]">
        <Stat icon={<Banknote className="size-3.5 md:size-4 text-[#233516]" />} label="Стоимость" value={`от ${cost.toLocaleString("ru-RU")} ₽`} />
        <Link
          href={`/route-detail?ids=${ids.join(",")}`}
          className="flex-shrink-0 bg-[#233516] hover:bg-[#1a2811] text-[#fffcf3] font-sans font-semibold text-xs md:text-sm py-1.5 md:py-2 px-2 md:px-3 rounded-lg transition-colors shadow-[0_2px_8px_rgba(35,53,22,0.3)]"
        >
          Подробнее
        </Link>
      </div>
    </>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex-shrink-0">{icon}</span>
      <div>
        <p className="font-sans text-[10px] text-[#233516]/50 uppercase tracking-wide leading-none mb-0.5">{label}</p>
        <p className="font-sans font-semibold text-sm text-[#233516]">{value}</p>
      </div>
    </div>
  );
}

function VariantOverlay({
  variants, selected, onSelect,
}: { variants: Variant[]; selected: number | null; onSelect: (i: number) => void }) {
  if (variants.length < 2) return null;
  return (
    <div className="absolute bottom-3 left-3 flex flex-col gap-1.5 z-[1000]">
      <p className="font-sans text-[10px] text-[#555] bg-white/85 backdrop-blur-sm px-2 py-0.5 rounded-full w-fit">
        На карте:
      </p>
      {variants.map((v, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={`font-sans text-xs px-3 py-1.5 rounded-full border shadow-sm backdrop-blur-sm transition-colors text-left ${
            (selected === null && i === 0) || selected === i
              ? "bg-[#233516] text-[#fffcf3] border-[#233516]"
              : "bg-white/90 text-[#233516] border-[#233516]/30 hover:border-[#233516]"
          }`}
        >
          {v.label || `Вариант ${i + 1}`}
        </button>
      ))}
    </div>
  );
}

// ─── main component ────────────────────────────────────────────────────────

export default function HeroChatMap() {
  const [places,          setPlaces]          = useState<Place[]>([]);
  const [hydrated,        setHydrated]        = useState(false);
  const [messages,        setMessages]        = useState<Message[]>([]);
  const [input,           setInput]           = useState("");
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState<string | null>(null);
  const [highlightedIds,  setHighlightedIds]  = useState<number[]>([]);
  const [variants,        setVariants]        = useState<Variant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [mapExpanded,     setMapExpanded]     = useState(false);
  const [mapVisible,      setMapVisible]      = useState(false);
  const [isAuthed,        setIsAuthed]        = useState(false);
  const [quizFields,          setQuizFields]          = useState<string[] | null>(null);
  const [pendingFirstMessage, setPendingFirstMessage] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/v1/places")
      .then((r) => r.json())
      .then(setPlaces)
      .catch(console.error);
  }, []);

  useEffect(() => {
    setIsAuthed(!!getUserToken());
  }, []);

  function openMap() {
    setMapExpanded(true);
    // two rAF frames so the element is in DOM before we trigger transition
    requestAnimationFrame(() => requestAnimationFrame(() => setMapVisible(true)));
  }

  function closeMap() {
    setMapVisible(false);
    setTimeout(() => setMapExpanded(false), 280);
  }

  // Close on Escape
  useEffect(() => {
    if (!mapExpanded) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeMap(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mapExpanded]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── restore from localStorage ──
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        setMessages(data.messages        ?? []);
        setHighlightedIds(data.highlightedIds  ?? []);
        setVariants(data.variants        ?? []);
        setSelectedVariant(data.selectedVariant ?? null);
      }
    } catch {}
    setHydrated(true);
  }, []);

  // ── persist to localStorage ──
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(LS_KEY, JSON.stringify({ messages, highlightedIds, variants, selectedVariant }));
  }, [hydrated, messages, highlightedIds, variants, selectedVariant]);

  // ── auto-scroll messages ──
  useEffect(() => {
    const el = containerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  // ── clear chat ──
  function clearChat() {
    setMessages([]);
    setHighlightedIds([]);
    setVariants([]);
    setSelectedVariant(null);
    setQuizFields(null);
    setPendingFirstMessage(null);
    setError(null);
    localStorage.removeItem(LS_KEY);
  }

  // Первое взаимодействие: извлекаем данные из сообщения → показываем квиз только с недостающими полями
  function handleFirstMessage(text: string) {
    const { missing, prefilled, cleaned } = extractQuizFromText(text);

    setMessages([
      { role: "user", content: text },
      { role: "assistant", content: "Расскажи немного о поездке — подберу маршрут точнее:" },
    ]);

    if (missing.length === 0) {
      // Все поля определены — сразу шлём в API
      setQuizFields(null);
      setPendingFirstMessage(null);
      sendMessage(cleaned);
    } else {
      // Часть полей найдена — показываем квиз с предзаполненными значениями
      setQuizFields(missing);
      setPendingFirstMessage(
        JSON.stringify({ cleaned, prefilled })
      );
    }
  }

  // ── select variant ──
  function selectVariant(i: number) {
    setSelectedVariant(i);
    setHighlightedIds(variants[i].ids);
  }

  // ── send message ──
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    setError(null);

    // Build history BEFORE pushing the new user message (completed messages only)
    const history = messages.filter((m) => m.content.trim() !== "");

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    let accumulated = "";
    setQuizFields(null);
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      await new Promise((r) => setTimeout(r, 2000));
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
        accumulated += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const upd = [...prev];
          upd[upd.length - 1] = { role: "assistant", content: accumulated };
          return upd;
        });
      }
      // Парсим маркер <<QUIZ:...>> — если есть, убираем из текста и показываем виджет
      const quiz = parseQuizMarker(accumulated);
      if (quiz) {
        accumulated = quiz.clean;
        setMessages((prev) => {
          const upd = [...prev];
          upd[upd.length - 1] = { role: "assistant", content: quiz.clean };
          return upd;
        });
        setQuizFields(quiz.fields);
      } else if (looksLikeClarifyingQuestion(accumulated)) {
        // Фолбэк: модель задала вопрос текстом, но забыла про маркер
        setQuizFields(["duration", "transport", "interests", "group"]);
      }

      const detected = parseVariants(accumulated, places);
      if (detected.length > 0) {
        const sorted = detected.map((v) => ({ ...v, ids: sortByNearestNeighbor(v.ids, places) }));
        setVariants(sorted.length > 1 ? sorted : []);
        setSelectedVariant(null);
        setHighlightedIds(sorted[0].ids);
      } else {
        setVariants([]);
        setSelectedVariant(null);
        const ids = sortByNearestNeighbor(detectPlaces(accumulated, places), places);
        // Снимаем лимит если это структурированный маршрут (есть «День N» или «Маршрут:»)
        const isRoute = /день\s+\d|маршрут:/i.test(accumulated);
        if (ids.length > 0 && (isRoute || ids.length <= 6)) setHighlightedIds(ids);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Гид временно недоступен");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }, [loading]);

  function dispatch(text: string) {
    if (messages.length === 0 && pendingFirstMessage === null) {
      handleFirstMessage(text);
    } else {
      sendMessage(text);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); dispatch(input); setInput(""); }
  }

  if (!hydrated) return null;

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">

      {/* ── Chat ── */}
      <div className="flex flex-col bg-white rounded-2xl shadow-[0_4px_40px_rgba(35,53,22,0.10)] overflow-hidden border border-[#e8e2d6] h-[420px] sm:h-[480px] lg:h-[520px]">

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#f0ebe0]">
          <div className="size-8 rounded-full bg-[#233516] flex items-center justify-center flex-shrink-0">
            <MessageCircle className="size-4 text-[#fffcf3]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-sans font-semibold text-sm text-[#0e0f11]">ИИ-гид по Алтаю</p>
            <p className="font-sans text-xs text-[#666]">Онлайн · отвечаю быстро</p>
          </div>
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              title="Очистить чат"
              className="flex items-center gap-1.5 text-[#bbb] hover:text-red-400 transition-colors font-sans text-xs px-2 py-1 rounded-lg hover:bg-red-50 flex-shrink-0"
            >
              <Trash2 className="size-3.5" />
              Сбросить
            </button>
          )}
        </div>

        {/* Messages */}
        <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
          {messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 py-4">
              <p className="font-sans text-sm text-[#666] text-center">
                Опишите, какой отдых хотите — и я подберу маршрут
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {QUICK_QUESTIONS.map((q) => (
                  <button key={q} onClick={() => dispatch(q)} disabled={loading}
                    className="bg-[#f5f0e8] hover:bg-[#ede6d9] border border-[#e0d8cc] text-[#233516] font-sans text-xs px-3 py-1.5 rounded-full transition-colors disabled:opacity-50">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => {
            const isLastAssistant = msg.role === "assistant" && i === messages.length - 1;
            return (
              <div key={i}>
                <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="size-6 rounded-full bg-[#233516] flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                      <Bot className="size-3.5 text-[#fffcf3]" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#233516] text-[#fffcf3] px-4 py-2.5 rounded-br-sm"
                      : "bg-[#f5f0e8] text-[#0e0f11] px-4 py-2.5 rounded-bl-sm"
                  }`}>
                    {msg.content ? (
                      msg.role === "assistant" ? (
                        <div className="prose prose-sm max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_strong]:font-semibold">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : msg.content
                    ) : <ThinkingStatus />}
                  </div>
                </div>

                {/* Inline quiz — показывается под последним сообщением ассистента */}
                {isLastAssistant && !loading && quizFields && (
                  <div className="ml-8">
                    <InlineQuiz
                      fields={quizFields}
                      prefilled={(() => {
                        try {
                          return JSON.parse(pendingFirstMessage ?? "{}") as Record<string, string | string[]>;
                        } catch {
                          return {};
                        }
                      })()}
                      onSubmit={(answerText) => {
                        setQuizFields(null);
                        if (pendingFirstMessage !== null) {
                          // First request: read {cleaned, prefilled} from storage
                          let cleaned = "";
                          let prefilled: Record<string, string | string[]> = {};
                          try {
                            const parsed = JSON.parse(pendingFirstMessage ?? "{}");
                            cleaned   = parsed.cleaned   ?? "";
                            prefilled = parsed.prefilled ?? {};
                          } catch {}
                          const prefilledText = Object.keys(prefilled).length > 0
                            ? parseQuizAnswer(prefilled)
                            : "";
                          const combined = prefilledText
                            ? `${cleaned}. ${prefilledText} ${answerText}`.trim()
                            : answerText;
                          setPendingFirstMessage(null);
                          // Оставляем user[0] + assistant[1] ("Расскажи о поездке") в истории,
                          // чтобы AI видел контекст и не спрашивал параметры повторно
                          setMessages((prev) => [prev[0], prev[1]]);
                          sendMessage(combined);
                        } else {
                          sendMessage(answerText);
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
              <AlertCircle className="size-4 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-sans text-xs text-red-600 leading-relaxed">{error}</p>
                <button
                  onClick={() => { setError(null); sendMessage(messages.filter(m => m.role === "user").at(-1)?.content ?? ""); }}
                  className="font-sans text-xs text-red-500 underline mt-1 hover:text-red-700"
                >
                  Попробовать ещё раз
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-4 pb-4 pt-2 border-t border-[#f0ebe0]">
          <div className="flex gap-2">
            <input
              type="text" value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Напишите сюда..."
              disabled={loading}
              className="flex-1 bg-[#f8f5ef] border border-[#e8e2d6] text-[#0e0f11] placeholder:text-[#bbb] font-sans text-sm rounded-xl px-4 py-2.5 outline-none focus:border-[#233516] focus:bg-white transition-all disabled:opacity-50"
            />
            <button
              onClick={() => { dispatch(input); setInput(""); }}
              disabled={loading || !input.trim()}
              className="bg-[#233516] text-[#fffcf3] px-4 py-2.5 rounded-xl hover:bg-[#1a2811] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send className="size-4" />
            </button>
          </div>
        </div>

        {/* Auth nudge */}
        {!isAuthed && (
          <div className="mx-4 mb-4 flex items-center gap-3 rounded-xl bg-[#f5f0e8] border border-[#e8e2d6] px-4 py-2.5">
            <Heart className="size-4 text-[#233516]/50 flex-shrink-0" />
            <p className="font-sans text-xs text-[#555] flex-1 leading-snug">
              Войдите, чтобы сохранять маршруты в избранное
            </p>
            <Link
              href="/login"
              className="font-sans text-xs font-semibold text-[#233516] hover:opacity-70 transition-opacity whitespace-nowrap"
            >
              Войти →
            </Link>
          </div>
        )}
      </div>

      {/* ── Map (inline) ── */}
      <div className="rounded-2xl overflow-hidden shadow-[0_4px_40px_rgba(35,53,22,0.10)] border border-[#e8e2d6] h-[300px] sm:h-[380px] lg:h-[520px] relative">
        <AltaiMap highlightedIds={highlightedIds} places={places} />

        {highlightedIds.length === 0 ? (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow text-xs font-sans text-[#666] pointer-events-none">
            Спросите гида — места появятся на карте
          </div>
        ) : (
          <RouteStats ids={highlightedIds} places={places} />
        )}

        <VariantOverlay variants={variants} selected={selectedVariant} onSelect={selectVariant} />

        {/* Expand button */}
        <button
          onClick={openMap}
          title="Развернуть карту"
          className="absolute top-3 left-3 bg-white border border-[#e8e2d6] rounded-lg p-2 shadow-sm hover:bg-[#f5f0e8] transition-colors z-[1000]"
        >
          <Maximize2 className="size-4 text-[#233516]" />
        </button>
      </div>

      {/* ── Full-screen map overlay ── */}
      {mapExpanded && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-8">
          {/* Backdrop with blur — z-index above navbar so header is also covered */}
          <div
            className="absolute inset-0 backdrop-blur-sm transition-opacity duration-300"
            style={{ backgroundColor: `rgba(0,0,0,${mapVisible ? 0.6 : 0})` }}
            onClick={closeMap}
          />

          {/* Map container with scale+opacity animation */}
          <div
            className="relative w-full h-full max-w-[1400px] max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl border border-[#e8e2d6] transition-all duration-300"
            style={{
              opacity: mapVisible ? 1 : 0,
              transform: mapVisible ? "scale(1)" : "scale(0.96)",
            }}
          >
            <AltaiMap highlightedIds={highlightedIds} places={places} />

            {highlightedIds.length > 0 && <RouteStats ids={highlightedIds} places={places} />}
            <VariantOverlay variants={variants} selected={selectedVariant} onSelect={selectVariant} />

            {/* Close button — top-left to avoid overlapping RouteStats (top-right) */}
            <button
              onClick={closeMap}
              className="absolute top-3 left-3 bg-white border border-[#e8e2d6] rounded-lg p-2 shadow-sm hover:bg-[#f5f0e8] transition-colors z-[1000]"
              title="Свернуть (Esc)"
            >
              <Minimize2 className="size-5 text-[#233516]" />
            </button>

            {/* Hint */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white/90 text-xs font-sans px-3 py-1.5 rounded-full pointer-events-none">
              Esc или клик на фон — свернуть
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
