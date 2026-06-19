"use client";

import { useState, useEffect } from "react";
import { X, GraduationCap } from "lucide-react";

const STORAGE_KEY = "thesis_banner_dismissed";

export function ThesisBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) setVisible(true);
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100vw-2rem)] max-w-2xl"
    >
      <div
        className="relative flex items-start gap-3 rounded-2xl px-5 py-4 shadow-2xl"
        style={{
          background: "linear-gradient(135deg, #233516 0%, #2d421b 100%)",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        {/* icon */}
        <div className="shrink-0 mt-0.5 size-8 rounded-xl bg-white/10 flex items-center justify-center">
          <GraduationCap size={17} className="text-white/90" />
        </div>

        {/* text */}
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-[14px] leading-snug">
            Учебный проект
          </p>
          <p className="text-white/60 text-[12.5px] leading-snug mt-0.5">
            Этот сайт создан в рамках выпускной квалификационной работы.
            Данные демонстрационные, функциональность может быть ограничена.
          </p>
        </div>

        {/* close */}
        <button
          onClick={dismiss}
          aria-label="Закрыть уведомление"
          className="shrink-0 mt-0.5 size-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
