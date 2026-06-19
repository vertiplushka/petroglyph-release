import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { Place, Route } from "@/lib/data";

// Internal backend URL (overridden in Docker via BACKEND_INTERNAL_URL)
const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || "http://localhost:4000";
const INTERNAL_SECRET = process.env.INTERNAL_SECRET ?? "";

// Fallback AI config from env (used if backend is unreachable)
const ENV_BASE_URL = process.env.ANTHROPIC_API_BASE_URL || "https://api.novimundi.space/v1";
const ENV_MODEL    = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5";
const ENV_API_KEY  = process.env.ANTHROPIC_API_KEY ?? "";

interface AIConfig { baseUrl: string; model: string; apiKey: string }
let aiConfigCache: AIConfig | null = null;
let aiConfigExpiry = 0;
const AI_CONFIG_TTL = 30_000;

async function fetchAIConfig(): Promise<AIConfig> {
  if (aiConfigCache && Date.now() < aiConfigExpiry) return aiConfigCache;
  try {
    const res = await fetch(`${BACKEND_URL}/settings/internal`, {
      headers: { "x-internal-secret": INTERNAL_SECRET },
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json();
      aiConfigCache = data;
      aiConfigExpiry = Date.now() + AI_CONFIG_TTL;
      return data;
    }
  } catch (e) {
    console.error("[chat] fetchAIConfig error:", e);
  }
  return { baseUrl: ENV_BASE_URL, model: ENV_MODEL, apiKey: ENV_API_KEY };
}

// In-memory rate limiter: 14 requests per 60 s per IP (API quota is 15/min)
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 14;
const MAX_MESSAGE_LENGTH = 1000;

const ipLog = new Map<string, number[]>();

// Simple in-memory cache so we don't hit the DB on every chat message
let placesCache: Place[] | null = null;
let routesCache: Route[] | null = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 60_000;

async function fetchPlaces(): Promise<Place[]> {
  if (placesCache && Date.now() < cacheExpiry) return placesCache;
  try {
    const res = await fetch(`${BACKEND_URL}/places`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    placesCache = data;
    cacheExpiry = Date.now() + CACHE_TTL_MS;
    return data;
  } catch (e) {
    console.error(`[chat] BACKEND_FETCH_PLACES_ERROR: ${e}`);
    // Fall back to static data if backend is unreachable
    const { places } = await import("@/lib/data");
    return places;
  }
}

async function fetchRoutes(): Promise<Route[]> {
  if (routesCache && Date.now() < cacheExpiry) return routesCache;
  try {
    const res = await fetch(`${BACKEND_URL}/routes`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    routesCache = data;
    return data;
  } catch (e) {
    console.error(`[chat] BACKEND_FETCH_ROUTES_ERROR: ${e}`);
    const { routes } = await import("@/lib/data");
    return routes;
  }
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (ipLog.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (timestamps.length >= MAX_REQUESTS) return true;
  timestamps.push(now);
  ipLog.set(ip, timestamps);
  return false;
}

function fmt(p: { name: string; category: string; description: string; tags: string[]; price: string; rating: number; lat: number; lng: number }) {
  return `• **${p.name}** [${p.lat}, ${p.lng}] — ${p.category}, ★${p.rating}, ${p.price}\n  ${p.description} Теги: ${p.tags.join(", ")}.`;
}

function fmtService(p: { name: string; category: string; description: string; price: string; rating: number; lat: number; lng: number }) {
  return `• ${p.name} [${p.lat}, ${p.lng}] — ${p.category}, ★${p.rating}, ${p.price}`;
}

async function buildPlannerSystemPrompt(): Promise<string> {
  const [places, routes] = await Promise.all([fetchPlaces(), fetchRoutes()]);
  const attractions = places.filter((p) => !p.type || p.type === "attraction");
  const hotels     = places.filter((p) => p.type === "hotel");
  const restaurants= places.filter((p) => p.type === "restaurant");
  const museums    = places.filter((p) => p.type === "museum");

  return `Ты — AI-гид по Горному Алтаю. Помогаешь туристам спланировать маршрут.
Отправная точка всех маршрутов — Горно-Алтайск [51.96, 85.96].
Координаты мест даны в формате [широта, долгота] — используй их, чтобы строить географически логичные маршруты.

## Достопримечательности и природные места
${attractions.map(fmt).join("\n")}

## Готовые маршруты
${routes.map((r) => `• **«${r.title}»** — ${r.path}. ${r.description.split(".")[0]}.`).join("\n")}

## Отели
${hotels.map(fmtService).join("\n")}

## Рестораны
${restaurants.map(fmtService).join("\n")}

## Музеи
${museums.map(fmtService).join("\n")}

## СТРОГИЕ ТРЕБОВАНИЯ К ФОРМАТУ
- Отвечай ТОЛЬКО на русском языке. Никакого английского.
- НЕ думай вслух. НЕ показывай процесс рассуждений. Пиши только финальный, готовый ответ.
- Координаты используй внутренне для выбора порядка мест — в ответе их НЕ упоминай.
- Ответ должен быть лаконичным: максимум 300–400 слов.

## Правила маршрута
1. Маршрут строй вокруг природных мест — они определяют путь.
2. Порядок мест должен быть **географически логичным**: от Горно-Алтайска по оптимальному пути, без лишних разворотов.
3. Отели, рестораны и музеи добавляй только как сервис по пути — выбирай ближайшие к точкам маршрута.
4. Когда нужно уточнить параметры поездки — СТРОГО используй этот шаблон и НИЧЕГО другого:
   Напиши 1 предложение вступления, затем на новой строке ОБЯЗАТЕЛЬНО поставь маркер:
   <<QUIZ:duration,transport,interests,group>>
   Маркер должен быть ПОСЛЕДНИМ в ответе. После него — пусто.
   НЕ задавай вопросы текстом — ТОЛЬКО маркер. Интерфейс сам покажет форму.
   Доступные параметры: duration, transport, interests, season, group

   Пример ПРАВИЛЬНОГО ответа:
   "Чтобы подобрать маршрут, уточни несколько деталей.
   <<QUIZ:duration,transport,interests,group>>"

5. Как только параметры получены — сразу строй конкретный маршрут, не спрашивай ничего дополнительно.
   КРИТИЧЕСКИ ВАЖНО: если в истории диалога уже был запрос параметров (фраза типа "Расскажи о поездке", "уточни детали" или маркер <<QUIZ>>) — это значит параметры УЖЕ получены. НИКОГДА не запрашивай их снова. Сообщение пользователя после такого запроса — это и есть его параметры, даже если они выглядят кратко. Строй маршрут немедленно.
6. При нескольких вариантах используй заголовки **«Вариант 1:»**, **«Вариант 2:»** и т.д.
7. Никогда не упоминай числовые id. Не придумывай места, которых нет в списке.
8. Форматируй ответы с markdown: заголовки, списки, жирный текст — это отображается в интерфейсе.

Отвечай кратко и информативно на русском языке.`;
}

async function buildPlaceSystemPrompt(placeId: number): Promise<string> {
  const places = await fetchPlaces();
  const place = places.find((p) => p.id === placeId);
  if (!place) {
    return "Ты — AI-гид по Горному Алтаю. Отвечай на вопросы туристов кратко и по-русски.";
  }

  // Ближайшие достопримечательности (в радиусе ~100 км по координатам)
  const nearby = places
    .filter((p) => p.id !== placeId && (!p.type || p.type === "attraction"))
    .map((p) => ({ ...p, dist: Math.hypot(p.lat - place.lat, p.lng - place.lng) }))
    .filter((p) => p.dist < 0.9)
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 4);

  const nearbyText = nearby.length > 0
    ? `\n\n**Ближайшие места** (можно совместить):\n${nearby.map((p) => `• ${p.name} (~${Math.round(p.dist * 111)} км) — ${p.description.split(".")[0]}.`).join("\n")}`
    : "";

  return `Ты — AI-гид по конкретному месту Горного Алтая.

**Место:** «${place.name}»
**Категория:** ${place.category}
**Координаты:** ${place.lat}°N, ${place.lng}°E (Горно-Алтайск — отправная точка [51.96°N, 85.96°E])
**Рейтинг:** ${place.rating}/5
**Цена:** ${place.price}
**Теги:** ${place.tags.join(", ")}

${place.description}${nearbyText}

Отвечай только по этому месту и ближайшим окрестностям. Акцент на практике:
— как добраться из Горно-Алтайска (расстояние, дорога)
— лучший сезон и почему
— что взять с собой
— на что обратить особое внимание

Форматируй ответы с markdown — это отображается в интерфейсе.
Отвечай кратко и информативно на русском языке.`;
}


interface HistoryMessage { role: "user" | "assistant"; content: string }

export async function POST(request: NextRequest) {
  const t0 = Date.now();
  const tReq = t0;
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  console.log(`[chat] → ${ip} | t=0ms`);

  if (isRateLimited(ip)) {
    console.log(`[chat] RATE-LIMITED ${ip} | t=${Date.now() - t0}ms`);
    return new Response(
      JSON.stringify({ error: "Слишком много запросов — подождите минуту" }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  const body = await request.json();
  const { message, history = [], mode, placeId } = body as {
    message: string;
    history: HistoryMessage[];
    mode: "planner" | "place";
    placeId?: number;
  };

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    console.log(`[chat] EMPTY_MESSAGE | t=${Date.now() - t0}ms`);
    return new Response(
      JSON.stringify({ error: "Пустое сообщение" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    console.log(`[chat] MSG_TOO_LONG (${message.length}) | t=${Date.now() - t0}ms`);
    return new Response(
      JSON.stringify({ error: `Сообщение слишком длинное (максимум ${MAX_MESSAGE_LENGTH} символов)` }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const [systemPrompt, aiConfig] = await Promise.all([
    mode === "place" && placeId != null
      ? buildPlaceSystemPrompt(placeId)
      : buildPlannerSystemPrompt(),
    fetchAIConfig(),
  ]);

  if (!aiConfig.apiKey) {
    console.log(`[chat] MISSING_API_KEY | t=${Date.now() - t0}ms`);
    return new Response(
      JSON.stringify({ error: "API-ключ не настроен. Укажите его в Настройках админки." }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  const client = new Anthropic({
    apiKey: aiConfig.apiKey,
    baseURL: aiConfig.baseUrl,
  });

  const messagesPayload = [
    ...history.slice(-10).map((m) => ({ role: m.role, content: m.content })),
    { role: "user" as const, content: message.trim() },
  ];

  const requestParams = {
    model: aiConfig.model,
    max_tokens: 2500,
    system: systemPrompt,
    messages: messagesPayload,
  };

  console.log(`[chat] SDK_START model=${aiConfig.model} mode=${mode ?? "planner"} baseURL=${aiConfig.baseUrl} | t=${Date.now() - tReq}ms`);
  console.log(`[chat] PARAMS:`, JSON.stringify(requestParams, null, 2));

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let outputText = "";
      let chunkCount = 0;
      const thinkingPattern = /^(Let me|Now I|I'm |I need|Actually|Looking at|For the|The |This |But |So |OK,|Here|Wait)/;

      try {
        const sdkStream = client.messages.stream(requestParams);

        for await (const event of sdkStream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            const chunk = event.delta.text;
            chunkCount++;
            outputText += chunk;

            const lastLines = outputText.split("\n").slice(-3).join("\n");
            if (thinkingPattern.test(lastLines.trimStart())) {
              console.log(`[chat] THINKING_CANCELLED after ${chunkCount} chunks | t=${Date.now() - tReq}ms`);
              await sdkStream.abort();
              break;
            }

            controller.enqueue(encoder.encode(chunk));
          }
        }

        console.log(`[chat] STREAM_DONE chunks=${chunkCount} bytes=${outputText.length} | t=${Date.now() - tReq}ms`);
      } catch (e) {
        if (e instanceof Anthropic.APIError) {
          console.error(`[chat] API_ERROR status=${e.status} message=${e.message} | t=${Date.now() - tReq}ms`);
          console.error(`[chat] FAILED_PARAMS:`, JSON.stringify(requestParams, null, 2));
          const isOverload = e.status === 529 || e.status === 500;
          const msg = isOverload
            ? "Сервис перегружен — попробуйте ещё раз через несколько секунд"
            : "Не удалось получить ответ от ИИ";
          controller.enqueue(encoder.encode(`\n\n[${msg}]`));
        } else {
          console.error(`[chat] STREAM_ERROR: ${e} | t=${Date.now() - tReq}ms`);
          controller.enqueue(encoder.encode("\n\n[Не удалось получить ответ от ИИ]"));
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
