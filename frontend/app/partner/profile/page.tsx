"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  decodePartnerToken, clearPartnerToken,
  getPartnerAnalytics, subscribePartner,
  AnalyticsData, PlaceStats,
} from "@/lib/partner-api";
import {
  BarChart2, Eye, Cpu, CalendarDays, BookOpen, LogOut,
  TrendingUp, Users, MapPin, Pencil, LayoutGrid,
  Zap, ShieldCheck, BarChart, Crown,
  ArrowRight, CheckCircle2, CreditCard, X, Lock,
  BadgeCheck, Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Period = "today" | "week" | "month";
const PERIOD_LABELS: Record<Period, string> = { today: "Сегодня", week: "Неделя", month: "Месяц" };

const SUB = {
  monthlyPrice:    19_500,
  annualPrice:    174_000,
  annualMonthly:   14_500,
  annualSavings:   60_000,
  discountPct:         26,
  boostMultiplier:      3,
  features: [
    { icon: Zap,        title: "Приоритет в ИИ",        desc: "Ваши объекты показываются первыми в ответах AI-гида" },
    { icon: TrendingUp, title: "×3 охват",              desc: "В 3 раза больше показов через AI-ассистента сайта" },
    { icon: BarChart,   title: "Расширенная аналитика", desc: "Почасовые отчёты по дням и месяцам" },
    { icon: Users,      title: "Персональный менеджер", desc: "Помощь в настройке карточек и продвижении" },
    { icon: MapPin,     title: "Топ каталога",          desc: "Приоритетное размещение в поиске по сайту" },
    { icon: BadgeCheck, title: "Значок партнёра",       desc: "Бейдж «Партнёр Petroglyph» на карточках объектов" },
  ],
} as const;

const fmt = (n: number) => n.toLocaleString("ru-RU");

// ─── Payment Modal ────────────────────────────────────────────────────────────

function PaymentModal({
  plan, onClose, onSuccess,
}: {
  plan: "monthly" | "annual";
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [card,    setCard]    = useState("");
  const [expiry,  setExpiry]  = useState("");
  const [cvv,     setCvv]     = useState("");
  const [name,    setName]    = useState("");
  const [step,    setStep]    = useState<"form" | "processing" | "done">("form");

  const price  = plan === "annual" ? fmt(SUB.annualPrice) : fmt(SUB.monthlyPrice);
  const period = plan === "annual" ? "год" : "месяц";

  function fmtCard(v: string) {
    return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  }
  function fmtExpiry(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setStep("processing");
    await new Promise((r) => setTimeout(r, 2200));   // fake processing delay
    try { await subscribePartner(plan); } catch {}
    setStep("done");
    setTimeout(onSuccess, 1800);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={step === "form" ? onClose : undefined} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-[420px] overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-[#1a2811] to-[#2d421b] px-6 py-5 flex items-center justify-between">
          <div>
            <div className="text-white font-bold text-sm">Оплата подписки</div>
            <div className="text-white/60 text-xs mt-0.5">
              {price} ₽ / {period} · Тариф «{plan === "annual" ? "Годовой" : "Месячный"}»
            </div>
          </div>
          {step === "form" && (
            <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
              <X size={18} />
            </button>
          )}
        </div>

        {step === "form" && (
          <form onSubmit={handlePay} className="p-6 flex flex-col gap-4">
            {/* Card number */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#555]">Номер карты</label>
              <div className="relative">
                <CreditCard size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#aaa]" />
                <input
                  className="w-full pl-10 pr-4 py-3 border border-[#e2ddd0] rounded-xl text-sm outline-none focus:border-[#233516] transition-colors font-mono tracking-wider"
                  placeholder="0000 0000 0000 0000"
                  value={card}
                  onChange={(e) => setCard(fmtCard(e.target.value))}
                  inputMode="numeric"
                  required
                  minLength={19}
                />
              </div>
            </div>

            {/* Cardholder */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#555]">Имя держателя</label>
              <input
                className="w-full px-3.5 py-3 border border-[#e2ddd0] rounded-xl text-sm outline-none focus:border-[#233516] transition-colors uppercase"
                placeholder="IVAN IVANOV"
                value={name}
                onChange={(e) => setName(e.target.value.toUpperCase())}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#555]">Срок действия</label>
                <input
                  className="w-full px-3.5 py-3 border border-[#e2ddd0] rounded-xl text-sm outline-none focus:border-[#233516] transition-colors font-mono"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={(e) => setExpiry(fmtExpiry(e.target.value))}
                  inputMode="numeric"
                  required
                  minLength={5}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#555]">CVV</label>
                <div className="relative">
                  <input
                    className="w-full px-3.5 py-3 border border-[#e2ddd0] rounded-xl text-sm outline-none focus:border-[#233516] transition-colors font-mono pr-10"
                    placeholder="•••"
                    type="password"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                    inputMode="numeric"
                    required
                    minLength={3}
                  />
                  <Lock size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#aaa]" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[#aaa] text-[10px] mt-1">
              <Lock size={10} />
              Тестовая оплата — деньги не списываются
            </div>

            <button
              type="submit"
              className="w-full bg-[#233516] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#2c4219] transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              Оплатить {price} ₽
            </button>
          </form>
        )}

        {step === "processing" && (
          <div className="p-10 flex flex-col items-center gap-4">
            <div className="size-14 rounded-full border-4 border-[#233516]/20 border-t-[#233516] animate-spin" />
            <div className="text-[#0e0f11] font-semibold text-sm">Обрабатываем платёж...</div>
            <div className="text-[#aaa] text-xs">Пожалуйста, подождите</div>
          </div>
        )}

        {step === "done" && (
          <div className="p-10 flex flex-col items-center gap-4">
            <div className="size-16 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-emerald-500" />
            </div>
            <div className="text-[#0e0f11] font-bold text-base text-center">Подписка активирована!</div>
            <div className="text-[#888] text-sm text-center">
              Ваши объекты уже получают буст ×{SUB.boostMultiplier} в AI-рекомендациях
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Stacked Bar Chart ────────────────────────────────────────────────────────

function StackedBarChart({ organic, bonus, labels, height = 120 }: {
  organic: number[]; bonus: number[]; labels: string[]; height?: number;
}) {
  const maxVal = Math.max(...organic.map((v, i) => v + (bonus[i] ?? 0)), 1);
  const [hov, setHov] = useState<number | null>(null);
  const showEvery = labels.length <= 24 ? Math.ceil(labels.length / 8) : Math.ceil(labels.length / 10);

  return (
    <div className="relative w-full select-none" style={{ height: height + 28 }}>
      <div className="flex items-end w-full gap-px" style={{ height }} onMouseLeave={() => setHov(null)}>
        {organic.map((org, i) => {
          const bon = bonus[i] ?? 0;
          const orgH = (org / maxVal) * 100;
          const bonH = (bon / maxVal) * 100;
          const isHov = hov === i;
          return (
            <div key={i} className="relative flex-1 flex flex-col justify-end cursor-default" style={{ height: "100%" }} onMouseEnter={() => setHov(i)}>
              {isHov && (
                <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                  <div className="bg-[#0e0f11] text-white text-[10px] font-semibold px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap flex flex-col gap-0.5">
                    {bon > 0 && <span className="text-[#a78bfa]">+{bon} от подписки</span>}
                    <span className="text-white/70">{org} органика</span>
                    <span className="border-t border-white/20 pt-0.5">Итого: {org + bon}</span>
                  </div>
                </div>
              )}
              <div className="w-full flex flex-col justify-end" style={{ height: "100%" }}>
                {bon > 0 && <div className="w-full rounded-t-[3px]" style={{ height: `${bonH}%`, background: "#7c3aed", opacity: isHov ? 1 : 0.85 }} />}
                <div className="w-full" style={{ height: `${orgH}%`, background: "#233516", opacity: isHov ? 1 : 0.75, borderRadius: bon > 0 ? "0" : "3px 3px 0 0" }} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex w-full mt-1.5">
        {labels.map((lbl, i) =>
          i % showEvery === 0
            ? <div key={i} className="flex-1 text-center text-[9px] text-[#aaa] font-medium truncate">{lbl}</div>
            : <div key={i} className="flex-1" />
        )}
      </div>
    </div>
  );
}

function SimpleBarChart({ data, labels, color, height = 120 }: {
  data: number[]; labels: string[]; color: string; height?: number;
}) {
  const max = Math.max(...data, 1);
  const [hov, setHov] = useState<number | null>(null);
  const showEvery = labels.length <= 24 ? Math.ceil(labels.length / 8) : Math.ceil(labels.length / 10);
  return (
    <div className="relative w-full select-none" style={{ height: height + 28 }}>
      <div className="flex items-end w-full gap-px" style={{ height }} onMouseLeave={() => setHov(null)}>
        {data.map((v, i) => {
          const isHov = hov === i;
          return (
            <div key={i} className="relative flex-1 flex flex-col justify-end cursor-default" style={{ height: "100%" }} onMouseEnter={() => setHov(i)}>
              {isHov && (
                <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                  <div className="bg-[#0e0f11] text-white text-[10px] font-semibold px-2 py-1 rounded-md shadow-lg whitespace-nowrap">{v}</div>
                </div>
              )}
              <div className="w-full rounded-t-[3px]" style={{ height: `${Math.max((v / max) * 100, v > 0 ? 2 : 0)}%`, background: color, opacity: isHov ? 1 : 0.75 }} />
            </div>
          );
        })}
      </div>
      <div className="flex w-full mt-1.5">
        {labels.map((lbl, i) =>
          i % showEvery === 0
            ? <div key={i} className="flex-1 text-center text-[9px] text-[#aaa] font-medium truncate">{lbl}</div>
            : <div key={i} className="flex-1" />
        )}
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: number | string; sub?: string; color: string;
}) {
  return (
    <div className="bg-white border border-[#e8e4d8] rounded-2xl p-5 flex items-center gap-4">
      <div className="size-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: color + "18" }}>
        <Icon size={18} style={{ color }} strokeWidth={1.75} />
      </div>
      <div>
        <div className="text-[#0e0f11] text-2xl font-bold tabular-nums leading-none">{value}</div>
        <div className="text-[#888] text-xs mt-0.5">{label}</div>
        {sub && <div className="text-[#bbb] text-[10px] mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

// ─── Sub Active Banner ────────────────────────────────────────────────────────

function SubActiveBanner({ endsAt }: { endsAt: string | null }) {
  const days = endsAt ? Math.max(0, Math.ceil((new Date(endsAt).getTime() - Date.now()) / 86400000)) : null;
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#1a2811] to-[#2d421b] rounded-2xl px-6 py-5 flex items-center justify-between gap-4">
      <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
      <div className="relative flex items-center gap-4">
        <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
          <Crown size={18} className="text-amber-400" />
        </div>
        <div>
          <div className="text-white font-semibold text-sm">Подписка активна</div>
          <div className="text-white/50 text-xs mt-0.5">
            {days !== null ? `Действует ещё ${days} ${days === 1 ? "день" : days < 5 ? "дня" : "дней"}` : "Бессрочная"}
          </div>
        </div>
      </div>
      <div className="relative flex items-center gap-2">
        <BadgeCheck size={16} className="text-emerald-400" />
        <span className="text-white/70 text-xs hidden sm:block">×{SUB.boostMultiplier} показов в ИИ</span>
      </div>
    </div>
  );
}

// ─── Upsell ───────────────────────────────────────────────────────────────────

function SubUpsell({ onSelect }: { onSelect: (plan: "monthly" | "annual") => void }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Crown size={16} className="text-amber-500" />
          <span className="text-[#0e0f11] font-semibold text-lg">Подписка Petroglyph</span>
        </div>
        <p className="text-[#888] text-sm">Получайте в {SUB.boostMultiplier}× больше клиентов через AI-гида</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Monthly */}
        <div className="bg-white border border-[#e8e4d8] rounded-2xl p-6 flex flex-col gap-4">
          <div>
            <div className="text-[#888] text-xs font-semibold uppercase tracking-wider mb-2">Ежемесячно</div>
            <div className="flex items-baseline gap-1">
              <span className="text-[#0e0f11] text-3xl font-bold">{fmt(SUB.monthlyPrice)}</span>
              <span className="text-[#888] text-sm">₽/мес</span>
            </div>
            <div className="text-[#bbb] text-xs mt-1">Без привязки к сроку</div>
          </div>
          <ul className="flex flex-col gap-1.5 text-xs text-[#666]">
            {["Приоритет в ИИ", "×3 охват", "Детальная аналитика"].map((f) => (
              <li key={f} className="flex items-center gap-2"><CheckCircle2 size={12} className="text-[#233516] shrink-0" />{f}</li>
            ))}
          </ul>
          <button onClick={() => onSelect("monthly")}
            className="w-full py-2.5 rounded-xl border border-[#233516] text-[#233516] text-sm font-semibold hover:bg-[#233516] hover:text-white transition-all">
            Выбрать
          </button>
        </div>

        {/* Annual */}
        <div className="relative bg-gradient-to-b from-[#233516] to-[#2d421b] rounded-2xl p-6 flex flex-col gap-4 shadow-lg shadow-[#233516]/20">
          <div className="absolute top-3 right-3 bg-amber-400 text-[#0e0f11] text-[10px] font-bold px-2 py-0.5 rounded-full">−{SUB.discountPct}%</div>
          <div>
            <div className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">Годовая подписка</div>
            <div className="flex items-baseline gap-1">
              <span className="text-white text-3xl font-bold">{fmt(SUB.annualMonthly)}</span>
              <span className="text-white/60 text-sm">₽/мес</span>
            </div>
            <div className="text-white/40 text-xs mt-1">{fmt(SUB.annualPrice)} ₽/год · экономия {fmt(SUB.annualSavings)} ₽</div>
          </div>
          <ul className="flex flex-col gap-1.5 text-xs text-white/70">
            {["Все преимущества", "Персональный менеджер", "Значок партнёра"].map((f) => (
              <li key={f} className="flex items-center gap-2"><CheckCircle2 size={12} className="text-emerald-400 shrink-0" />{f}</li>
            ))}
          </ul>
          <button onClick={() => onSelect("annual")}
            className="w-full py-2.5 rounded-xl bg-white text-[#233516] text-sm font-bold hover:bg-white/90 transition-all flex items-center justify-center gap-2">
            Подключить <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {SUB.features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-white border border-[#e8e4d8] rounded-xl p-4 flex gap-3">
            <div className="size-8 rounded-lg bg-[#233516]/8 flex items-center justify-center shrink-0 mt-0.5">
              <Icon size={14} className="text-[#233516]" strokeWidth={2} />
            </div>
            <div>
              <div className="text-[#0e0f11] text-sm font-semibold leading-snug">{title}</div>
              <div className="text-[#888] text-xs mt-0.5 leading-snug">{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Place Card ───────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  attraction: "#10b981", hotel: "#0ea5e9",
  restaurant: "#f59e0b", museum: "#8b5cf6",
};

function PlaceCard({ place, isActive, onClick }: {
  place: PlaceStats; isActive: boolean; onClick: () => void;
}) {
  const accentColor = TYPE_COLORS[place.type] ?? "#233516";
  return (
    <div onClick={onClick} className={cn(
      "bg-white border rounded-2xl overflow-hidden flex flex-col cursor-pointer transition-all duration-200 group",
      isActive ? "border-[#233516] ring-2 ring-[#233516]/15 shadow-lg" : "border-[#e8e4d8] hover:border-[#233516]/30 hover:shadow-md"
    )}>
      {/* Image */}
      <div className="relative h-40 bg-gradient-to-br from-[#f0ece0] to-[#e8e4d8] overflow-hidden">
        {isActive && (
          <div className="absolute top-2 left-2 z-10 bg-[#233516] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shadow">
            Выбран
          </div>
        )}
        {place.image
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={place.image} alt={place.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
          : <div className="w-full h-full flex items-center justify-center">
              <MapPin size={32} className="text-[#c0bab0]" strokeWidth={1.5} />
            </div>
        }
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        {/* Type badge */}
        <div className="absolute bottom-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-md text-white"
          style={{ background: accentColor + "cc" }}>
          {place.type === "attraction" ? "Достопримечательность" : place.type === "hotel" ? "Отель" : place.type === "restaurant" ? "Ресторан" : "Музей"}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Title row */}
        <div className="flex items-start justify-between gap-2 min-w-0">
          <div className="min-w-0 flex-1">
            <div className="text-[#0e0f11] font-semibold text-[13px] leading-snug truncate">{place.name}</div>
            <div className="text-[#aaa] text-[11px] mt-0.5 truncate">{place.category}</div>
          </div>
          <Link href={`/partner/places/${place.id}/edit`} onClick={(e) => e.stopPropagation()}
            className="shrink-0 p-1.5 rounded-lg text-[#aaa] hover:text-[#233516] hover:bg-[#233516]/8 transition-colors mt-0.5" title="Редактировать">
            <Pencil size={13} />
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl px-3 py-2.5 text-center" style={{ background: "#23351610" }}>
            <div className="text-[#0e0f11] text-xl font-bold tabular-nums leading-none">{place.views}</div>
            <div className="flex items-center justify-center gap-1 mt-1 text-[#888] text-[10px]">
              <Eye size={9} /> просмотров
            </div>
          </div>
          <div className="bg-[#f0edf9] rounded-xl px-3 py-2.5 text-center">
            <div className="text-[#7c3aed] text-xl font-bold tabular-nums leading-none">{place.aiShows}</div>
            <div className="flex items-center justify-center gap-1 mt-1 text-[#7c3aed]/70 text-[10px]">
              <Cpu size={9} /> показов ИИ
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PartnerProfilePage() {
  const router = useRouter();
  const [period, setPeriod] = useState<Period>("today");
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [partnerId, setPartnerId] = useState<number | null>(null);
  const [paymentPlan, setPaymentPlan] = useState<"monthly" | "annual" | null>(null);

  useEffect(() => {
    const decoded = decodePartnerToken();
    if (!decoded) { router.push("/login/partner"); return; }
    setPartnerId(decoded.partnerId);
  }, [router]);

  const fetchData = useCallback(async (pid: number, p: Period, placeId: number | null) => {
    setLoading(true); setError("");
    try { setData(await getPartnerAnalytics(pid, p, placeId ?? undefined)); }
    catch { setError("Не удалось загрузить данные"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (partnerId) fetchData(partnerId, period, selectedPlaceId);
  }, [partnerId, period, selectedPlaceId, fetchData]);

  function handleLogout() { clearPartnerToken(); router.push("/login/partner"); }

  function handlePaymentSuccess() {
    setPaymentPlan(null);
    if (partnerId) fetchData(partnerId, period, selectedPlaceId);
  }

  const isSubscribed = data?.subscription?.active ?? false;
  const totalViews   = data?.views.reduce((a, b) => a + b, 0) ?? 0;
  const totalAi      = data?.aiShows.reduce((a, b) => a + b, 0) ?? 0;

  const aiOrganic = isSubscribed
    ? (data?.aiShows.map((v) => Math.round(v / SUB.boostMultiplier)) ?? [])
    : (data?.aiShows ?? []);
  const aiBonus = isSubscribed
    ? (data?.aiShows.map((v) => v - Math.round(v / SUB.boostMultiplier)) ?? [])
    : (data?.aiShows.map((v) => Math.round(v * (SUB.boostMultiplier - 1))) ?? []);

  const subBonus = aiBonus.reduce((a, b) => a + b, 0);
  const hasMultiple = (data?.perPlace.length ?? 0) > 1;

  return (
    <div className="min-h-screen bg-[#fffcf3]">
      {/* Header */}
      <div className="border-b border-[#0e0f11]/6 bg-white">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-[#233516]/10 flex items-center justify-center">
              <BarChart2 size={17} className="text-[#233516]" strokeWidth={1.75} />
            </div>
            <div>
              <div className="text-[#0e0f11] font-semibold text-sm">Кабинет партнёра</div>
              {data && (
                <div className="text-[#888] text-xs mt-0.5 flex items-center gap-1">
                  {isSubscribed && <BadgeCheck size={11} className="text-[#233516]" />}
                  {selectedPlaceId
                    ? data.perPlace.find((p) => p.id === selectedPlaceId)?.name
                    : `${data.perPlace.length} ${data.perPlace.length === 1 ? "объект" : data.perPlace.length < 5 ? "объекта" : "объектов"}`}
                </div>
              )}
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-[#888] hover:text-[#0e0f11] text-sm transition-colors">
            <LogOut size={15} /> Выйти
          </button>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-8 flex flex-col gap-6">

        {isSubscribed && data?.subscription && <SubActiveBanner endsAt={data.subscription.endsAt} />}

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-white border border-[#e8e4d8] rounded-xl p-1">
            {(["today", "week", "month"] as Period[]).map((p) => (
              <button key={p} onClick={() => setPeriod(p)}
                className={cn("px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  period === p ? "bg-[#233516] text-white shadow-sm" : "text-[#555] hover:text-[#0e0f11]")}>
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
          {hasMultiple && data && (
            <div className="flex items-center gap-1 bg-white border border-[#e8e4d8] rounded-xl p-1 flex-wrap">
              <button onClick={() => setSelectedPlaceId(null)}
                className={cn("flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  selectedPlaceId === null ? "bg-[#233516] text-white shadow-sm" : "text-[#555] hover:text-[#0e0f11]")}>
                <LayoutGrid size={11} /> Все объекты
              </button>
              {data.perPlace.map((p) => (
                <button key={p.id} onClick={() => setSelectedPlaceId(p.id)} title={p.name}
                  className={cn("px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all max-w-[160px] truncate",
                    selectedPlaceId === p.id ? "bg-[#233516] text-white shadow-sm" : "text-[#555] hover:text-[#0e0f11]")}>
                  {p.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {error && <div className="bg-red-50 border border-red-100 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}

        {loading ? (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <div key={i} className="bg-white border border-[#e8e4d8] rounded-2xl h-[88px] animate-pulse" />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {[...Array(2)].map((_, i) => <div key={i} className="bg-white border border-[#e8e4d8] rounded-2xl h-[220px] animate-pulse" />)}
            </div>
          </div>
        ) : data ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Eye}      label="Просмотров"    value={totalViews} color="#233516" sub={PERIOD_LABELS[period].toLowerCase()} />
              <StatCard icon={Cpu}      label="Показов в ИИ"  value={totalAi}    color="#7c3aed" sub={PERIOD_LABELS[period].toLowerCase()} />
              <StatCard icon={BookOpen} label="Бронирований"  value={data.totalBookings}  color="#0ea5e9" sub="всего" />
              <StatCard icon={Users}    label="Заявок"        value={data.totalRequests}  color="#f59e0b" sub="всего" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-white border border-[#e8e4d8] rounded-2xl p-6 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-lg bg-[#7c3aed]/10 flex items-center justify-center">
                      <Cpu size={15} className="text-[#7c3aed]" strokeWidth={1.75} />
                    </div>
                    <div>
                      <div className="text-[#0e0f11] text-sm font-semibold">Показы через ИИ</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-1 text-[10px] text-[#555]"><span className="inline-block size-2 rounded-sm bg-[#233516]" /> органика</span>
                        <span className="flex items-center gap-1 text-[10px] text-[#7c3aed]"><span className="inline-block size-2 rounded-sm bg-[#7c3aed]" />{isSubscribed ? "подписка" : "прогноз"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[#0e0f11] text-xl font-bold tabular-nums">{totalAi}</div>
                    {subBonus > 0 && <div className={cn("text-[10px] font-semibold", isSubscribed ? "text-[#7c3aed]" : "text-[#aaa]")}>{isSubscribed ? `+${subBonus} от подписки` : `+${subBonus} с подпиской`}</div>}
                  </div>
                </div>
                <StackedBarChart organic={aiOrganic} bonus={aiBonus} labels={data.labels} />
              </div>

              <div className="bg-white border border-[#e8e4d8] rounded-2xl p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-lg bg-[#233516]/10 flex items-center justify-center">
                      <Eye size={15} className="text-[#233516]" strokeWidth={1.75} />
                    </div>
                    <span className="text-[#0e0f11] text-sm font-semibold">Просмотры карточки</span>
                  </div>
                  <div className="text-right">
                    <div className="text-[#0e0f11] text-xl font-bold tabular-nums">{totalViews}</div>
                    <div className="text-[#aaa] text-[10px]">за период</div>
                  </div>
                </div>
                <SimpleBarChart data={data.views} labels={data.labels} color="#233516" />
              </div>
            </div>

            {/* Subscription */}
            <div className="border-t border-[#e8e4d8] pt-6">
              {isSubscribed ? (
                <div className="bg-white border border-[#e8e4d8] rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <ShieldCheck size={16} className="text-emerald-500" />
                    <span className="text-[#0e0f11] font-semibold">Детали подписки</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { label: "Тариф",               value: "Годовая",      sub: `${fmt(SUB.annualMonthly)} ₽/мес` },
                      { label: "Буст в ИИ",            value: `×${SUB.boostMultiplier}`,  sub: "показов от органики" },
                      { label: "Показов от подписки",  value: subBonus,       sub: PERIOD_LABELS[period].toLowerCase() },
                    ].map(({ label, value, sub }) => (
                      <div key={label} className="bg-[#f5f2e8] rounded-xl p-4 text-center">
                        <div className="text-[#0e0f11] text-xl font-bold">{value}</div>
                        <div className="text-[#888] text-xs mt-0.5">{label}</div>
                        <div className="text-[#bbb] text-[10px] mt-0.5">{sub}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <SubUpsell onSelect={setPaymentPlan} />
              )}
            </div>

            {/* Objects */}
            {data.perPlace.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-[#0e0f11] font-semibold text-lg">Мои объекты</h2>
                  <span className="bg-[#233516]/8 text-[#233516] text-xs font-bold px-2.5 py-1 rounded-full">{data.perPlace.length}</span>
                  {selectedPlaceId && (
                    <button onClick={() => setSelectedPlaceId(null)} className="text-xs text-[#888] hover:text-[#233516] underline underline-offset-2 transition-colors">Показать все</button>
                  )}
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {data.perPlace.map((place) => (
                    <PlaceCard key={place.id} place={place}
                      isActive={selectedPlaceId === place.id}
                      onClick={() => setSelectedPlaceId(selectedPlaceId === place.id ? null : place.id)} />
                  ))}
                </div>
              </div>
            )}

            {data.perPlace.length === 0 && (
              <div className="bg-white border border-[#e8e4d8] rounded-2xl p-8 flex flex-col items-center text-center gap-3">
                <div className="size-12 rounded-2xl bg-[#f5f2e8] flex items-center justify-center">
                  <TrendingUp size={22} className="text-[#bbb]" strokeWidth={1.5} />
                </div>
                <div className="text-[#0e0f11] font-semibold">Объекты не привязаны</div>
                <div className="text-[#888] text-sm max-w-[380px]">Обратитесь к администратору.</div>
              </div>
            )}

            <div className="flex items-center gap-2 text-[11px] text-[#bbb]">
              <CalendarDays size={13} />
              {period === "today" && "Данные за сегодняшний день по часам (0:00–23:00)"}
              {period === "week"  && "Данные за последние 7 дней"}
              {period === "month" && "Данные за последние 30 дней"}
            </div>
          </>
        ) : null}
      </div>

      {/* Payment modal */}
      {paymentPlan && (
        <PaymentModal
          plan={paymentPlan}
          onClose={() => setPaymentPlan(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
