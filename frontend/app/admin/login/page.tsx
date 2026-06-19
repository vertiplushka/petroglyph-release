"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/admin-api";
import { Logo } from "@/components/logo";
import { Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      router.push("/admin/places");
    } catch {
      setError("Неверный логин или пароль");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel ─────────────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #182610 0%, #233516 55%, #2d421b 100%)",
        }}
      >
        {/* dot grid */}
        <div
          className="absolute inset-0 opacity-[0.045] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        {/* Mountain silhouette */}
        <svg
          className="absolute bottom-0 left-0 right-0 w-full opacity-[0.11]"
          viewBox="0 0 800 280"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,280 L0,190 L70,125 L130,168 L210,68 L295,122 L375,22 L455,92 L535,52 L598,104 L678,32 L755,112 L800,82 L800,280 Z"
            fill="white"
          />
          <path
            d="M0,280 L0,235 L55,188 L115,214 L175,158 L252,196 L335,138 L398,172 L475,128 L545,164 L625,116 L698,152 L800,134 L800,280 Z"
            fill="white"
            opacity="0.4"
          />
        </svg>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <Logo color="white" className="w-10 h-10 shrink-0" />
          <span className="text-white text-xl font-semibold tracking-wide">
            Petroglyph
          </span>
        </div>

        {/* Tagline */}
        <div className="relative">
          <p className="text-white/35 text-[11px] font-semibold tracking-[0.15em] uppercase mb-5">
            Панель управления
          </p>
          <h1 className="text-white text-[2.4rem] font-semibold leading-[1.2] max-w-[320px]">
            Управление контентом Горного Алтая
          </h1>
          <p className="text-white/40 text-sm mt-5 leading-relaxed max-w-[280px]">
            Добавляйте и редактируйте места, маршруты и отзывы для туристов.
          </p>
        </div>

        {/* Footer */}
        <div className="relative flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-white/20 text-[11px] tracking-wide">© 2026 Petroglyph</span>
        </div>
      </div>

      {/* ── Right panel ────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-[#fffcf3] p-8">
        <div className="w-full max-w-[360px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <Logo color="#233516" className="w-9 h-9 shrink-0" />
            <span className="text-[#0e0f11] text-xl font-semibold">
              Petroglyph
            </span>
          </div>

          <div className="mb-9">
            <h2 className="text-[#0e0f11] text-[2rem] font-semibold leading-tight">
              Добро пожаловать
            </h2>
            <p className="text-[#888] text-sm mt-2">Войдите в панель управления</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#0e0f11]">Логин</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white border border-[#e2ddd0] rounded-xl px-4 py-3 text-[#0e0f11] text-sm outline-none focus:border-[#233516] transition-colors placeholder:text-[#c4bfb2]"
                placeholder="admin"
                autoComplete="username"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#0e0f11]">Пароль</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-[#e2ddd0] rounded-xl px-4 py-3 pr-12 text-[#0e0f11] text-sm outline-none focus:border-[#233516] transition-colors placeholder:text-[#c4bfb2]"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  tabIndex={-1}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#b0aba0] hover:text-[#555] transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 text-red-700 rounded-xl px-4 py-3 text-sm">
                <div className="size-4 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                  <span className="text-white text-[10px] font-bold leading-none">!</span>
                </div>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full bg-[#233516] text-white rounded-xl py-3 text-sm font-semibold hover:bg-[#2c4219] active:scale-[0.99] transition-all disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin size-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Вход...
                </span>
              ) : (
                "Войти"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
