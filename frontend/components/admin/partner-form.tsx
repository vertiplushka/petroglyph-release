"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Partner, createPartner, updatePartner } from "@/lib/admin-api";
import { ChevronLeft, Save, Eye, EyeOff } from "lucide-react";

const inputCls =
  "w-full bg-white border border-[#e2ddd0] rounded-xl px-3.5 py-2.5 text-[#0e0f11] text-sm outline-none focus:border-[#233516] transition-colors placeholder:text-[#c4bfb2]";

const sectionLabel = "text-[10px] font-bold tracking-[0.14em] uppercase text-[#aaa] mb-3";

interface Props {
  initial?: Partner;
  mode: "create" | "edit";
}

type FormData = {
  companyName: string;
  legalAddress: string;
  inn: string;
  kpp: string;
  ogrn: string;
  contactPerson: string;
  phone: string;
  email: string;
  password: string;
  subscriptionActive: boolean;
  subscriptionEndsAt: string;
};

const EMPTY: FormData = {
  companyName: "",
  legalAddress: "",
  inn: "",
  kpp: "",
  ogrn: "",
  contactPerson: "",
  phone: "",
  email: "",
  password: "",
  subscriptionActive: false,
  subscriptionEndsAt: "",
};

export default function PartnerForm({ initial, mode }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(
    initial
      ? {
          companyName: initial.companyName,
          legalAddress: initial.legalAddress,
          inn: initial.inn,
          kpp: initial.kpp,
          ogrn: initial.ogrn,
          contactPerson: initial.contactPerson,
          phone: initial.phone,
          email: initial.email,
          password: "",
          subscriptionActive: initial.subscriptionActive ?? false,
          subscriptionEndsAt: initial.subscriptionEndsAt
            ? new Date(initial.subscriptionEndsAt).toISOString().split("T")[0]
            : "",
        }
      : EMPTY
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        ...form,
        subscriptionEndsAt: form.subscriptionEndsAt || null,
      };
      if (mode === "create") {
        await createPartner(payload as Parameters<typeof createPartner>[0]);
      } else {
        const { password, ...rest } = payload;
        await updatePartner(initial!.id, password ? { ...rest, password } : rest);
      }
      router.push("/admin/partners");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col min-h-screen">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-[#fffcf3] border-b border-[#e8e4d8] px-6 lg:px-8 py-4 flex items-center gap-4">
        <Link
          href="/admin/partners"
          className="p-2 rounded-xl text-[#888] hover:text-[#233516] hover:bg-[#233516]/8 transition-colors"
        >
          <ChevronLeft size={18} />
        </Link>
        <h1 className="text-[#0e0f11] text-xl font-semibold">
          {mode === "create" ? "Новый партнёр" : "Редактировать партнёра"}
        </h1>
      </div>

      {/* Body */}
      <div className="flex-1 p-6 lg:p-8">
        <div className="max-w-[860px] flex flex-col gap-5">

          {/* Юридические данные */}
          <div className="bg-white border border-[#e8e4d8] rounded-2xl p-6">
            <p className={sectionLabel}>Юридические данные</p>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#555]">Наименование компании</label>
                <input type="text" value={form.companyName}
                  onChange={(e) => set("companyName", e.target.value)}
                  className={inputCls} required placeholder="ООО «Алтай Гид»" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#555]">Юридический адрес</label>
                <input type="text" value={form.legalAddress}
                  onChange={(e) => set("legalAddress", e.target.value)}
                  className={inputCls} required placeholder="649000, Республика Алтай..." />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#555]">ИНН</label>
                  <input type="text" value={form.inn} onChange={(e) => set("inn", e.target.value)}
                    className={inputCls} required placeholder="0411123456" maxLength={12} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#555]">КПП</label>
                  <input type="text" value={form.kpp} onChange={(e) => set("kpp", e.target.value)}
                    className={inputCls} required placeholder="041101001" maxLength={9} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#555]">ОГРН</label>
                  <input type="text" value={form.ogrn} onChange={(e) => set("ogrn", e.target.value)}
                    className={inputCls} required placeholder="1234567890123" maxLength={15} />
                </div>
              </div>
            </div>
          </div>

          {/* Контакты */}
          <div className="bg-white border border-[#e8e4d8] rounded-2xl p-6">
            <p className={sectionLabel}>Контактное лицо</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#555]">ФИО контактного лица</label>
                <input type="text" value={form.contactPerson}
                  onChange={(e) => set("contactPerson", e.target.value)}
                  className={inputCls} required placeholder="Иванов Иван Иванович" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#555]">Номер телефона</label>
                <input type="tel" value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  className={inputCls} required placeholder="+7 913 000 00 00" />
              </div>
            </div>
          </div>

          {/* Доступ */}
          <div className="bg-white border border-[#e8e4d8] rounded-2xl p-6">
            <p className={sectionLabel}>Данные для входа</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#555]">Email</label>
                <input type="email" value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  className={inputCls} required placeholder="partner@example.ru" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#555]">
                  {mode === "create" ? "Пароль" : "Новый пароль (оставьте пустым, чтобы не менять)"}
                </label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    className={`${inputCls} pr-10`}
                    required={mode === "create"} placeholder="••••••••"
                    minLength={mode === "create" ? 6 : undefined} />
                  <button type="button" onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-[#555] transition-colors">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Подписка */}
          <div className="bg-white border border-[#e8e4d8] rounded-2xl p-6">
            <p className={sectionLabel}>Подписка</p>
            <div className="flex flex-col gap-4">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div className="relative shrink-0">
                  <input type="checkbox" checked={form.subscriptionActive}
                    onChange={(e) => set("subscriptionActive", e.target.checked)}
                    className="sr-only" />
                  <div className={`w-11 h-6 rounded-full transition-colors duration-200 ${form.subscriptionActive ? "bg-[#233516]" : "bg-[#ddd]"}`}>
                    <div className={`size-5 bg-white rounded-full shadow-sm transition-transform duration-200 mt-0.5 ${form.subscriptionActive ? "translate-x-[22px]" : "translate-x-0.5"}`} />
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#0e0f11]">
                    {form.subscriptionActive ? "Подписка активна" : "Подписка не активна"}
                  </div>
                  <div className="text-xs text-[#888]">
                    {form.subscriptionActive ? "Партнёр получает буст ×3 в ИИ-рекомендациях" : "Активируйте для включения приоритетных показов"}
                  </div>
                </div>
              </label>
              {form.subscriptionActive && (
                <div className="flex flex-col gap-1.5 max-w-xs">
                  <label className="text-xs font-semibold text-[#555]">Подписка действует до</label>
                  <input type="date" value={form.subscriptionEndsAt}
                    onChange={(e) => set("subscriptionEndsAt", e.target.value)}
                    className={inputCls} />
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="sticky bottom-0 bg-[#fffcf3] border-t border-[#e8e4d8] px-6 lg:px-8 py-4">
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 rounded-xl px-4 py-2.5 text-sm mb-4">
            {error}
          </div>
        )}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 bg-[#233516] text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-[#2c4219] active:scale-[0.99] transition-all disabled:opacity-60">
            <Save size={14} />
            {saving ? "Сохранение..." : "Сохранить"}
          </button>
          <Link href="/admin/partners"
            className="px-5 py-2.5 text-sm font-medium text-[#888] hover:text-[#0e0f11] transition-colors">
            Отмена
          </Link>
        </div>
      </div>
    </form>
  );
}
