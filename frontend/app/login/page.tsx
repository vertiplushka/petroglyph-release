"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { Field, Input, OutlineButton, PrimaryButton } from "@/components/form";
import { apiUserLogin, setUserToken } from "@/lib/user-auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/profile";
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"login" | "password">("login");
  const [forgotSent, setForgotSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (step === "login") {
      if (login.trim()) setStep("password");
      return;
    }
    setLoading(true);
    try {
      const { access_token } = await apiUserLogin(login, password);
      setUserToken(access_token);
      router.push(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неверный логин или пароль");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {step === "login" && (
        <p className="text-center text-xs text-[#233516] font-medium">
          Введи email или телефон
        </p>
      )}

      <Field label="Email или номер телефона">
        <Input
          type="text"
          placeholder="name@mail.ru"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          autoFocus
          required
        />
      </Field>

      {step === "password" && (
        <Field label="Пароль">
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            required
          />
        </Field>
      )}

      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}

      {forgotSent ? (
        <p className="self-end text-xs text-[#233516]">
          Инструкция отправлена на {login || "почту"}
        </p>
      ) : (
        <button
          type="button"
          onClick={() => login && setForgotSent(true)}
          className="self-end text-xs text-[#0e0f11]/70 underline hover:text-[#233516]"
        >
          Забыли пароль?
        </button>
      )}

      <PrimaryButton type="submit" disabled={loading}>
        {loading ? "Входим…" : "Войти"}
      </PrimaryButton>

      <div className="flex items-center gap-2 text-xs text-[#0e0f11]/70">
        <div className="h-px flex-1 bg-[#0e0f11]/10" />
        <span>Нет аккаунта?</span>
        <Link href="/register" className="text-[#233516] underline font-medium">
          Регистрация
        </Link>
        <div className="h-px flex-1 bg-[#0e0f11]/10" />
      </div>

      <Link href="/login/partner" className="block">
        <OutlineButton type="button">Я партнёр</OutlineButton>
      </Link>
    </form>
  );
}

export default function LoginPage() {
  return (
    <AuthShell
      title="Войти как турист"
      subtitle="Сохраняйте маршруты, избранное и истории на любом устройстве"
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
