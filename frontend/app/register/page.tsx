"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { Field, Input, OutlineButton, PrimaryButton } from "@/components/form";
import { apiUserRegister, setUserToken } from "@/lib/user-auth";

export default function RegisterPage() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Пароль должен быть не менее 8 символов");
      return;
    }
    if (password !== confirm) {
      setError("Пароли не совпадают");
      return;
    }
    setLoading(true);
    try {
      const { access_token } = await apiUserRegister(login, password);
      setUserToken(access_token);
      router.push("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Создать аккаунт туриста"
      subtitle="Сохраняйте маршруты, избранное и истории на любом устройстве"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Email или номер телефона">
          <Input
            type="text"
            placeholder="name@mail.ru"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            required
            autoFocus
          />
        </Field>

        <Field label="Пароль" hint="Минимум 8 символов">
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>

        <Field label="Повтор пароля">
          <Input
            type="password"
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </Field>

        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        <PrimaryButton type="submit" disabled={loading}>
          {loading ? "Создаём аккаунт…" : "Создать"}
        </PrimaryButton>

        <div className="flex items-center gap-2 text-xs text-[#0e0f11]/70">
          <div className="h-px flex-1 bg-[#0e0f11]/10" />
          <span>Уже есть аккаунт?</span>
          <Link href="/login" className="text-[#233516] underline font-medium">
            Войти
          </Link>
          <div className="h-px flex-1 bg-[#0e0f11]/10" />
        </div>

        <Link href="/login/partner" className="block">
          <OutlineButton type="button">Я партнёр</OutlineButton>
        </Link>

        <p className="text-[11px] text-[#0e0f11]/60 text-center leading-relaxed">
          Регистрируясь, вы соглашаетесь с{" "}
          <Link href="/privacy" className="underline">
            политикой конфиденциальности
          </Link>{" "}
          и{" "}
          <Link href="/terms" className="underline">
            условиями использования
          </Link>
          .
        </p>
      </form>
    </AuthShell>
  );
}
