"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { Field, Input, OutlineButton, PrimaryButton } from "@/components/form";
import { partnerLogin } from "@/lib/partner-api";

export default function PartnerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await partnerLogin(email, password);
      router.push("/partner/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Войти как партнёр"
      subtitle="Управляйте карточками, событиями и смотрите статистику"
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <p className="text-center text-xs text-[#233516] font-medium">
          Введите email и пароль
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-xs text-center">
            {error}
          </div>
        )}

        <Field label="Email">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="partner@example.ru"
            required
          />
        </Field>

        <Field label="Пароль">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </Field>

        <PrimaryButton type="submit" disabled={loading}>
          {loading ? "Вход..." : "Войти"}
        </PrimaryButton>

        <Link href="/partners" className="block">
          <OutlineButton type="button">Хочу стать партнёром</OutlineButton>
        </Link>

        <Link href="/login" className="block">
          <OutlineButton type="button">Я турист</OutlineButton>
        </Link>
      </form>
    </AuthShell>
  );
}
