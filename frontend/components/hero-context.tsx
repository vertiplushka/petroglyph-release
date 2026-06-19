"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface HeroCtxValue {
  isHero: boolean;
  setIsHero: (v: boolean) => void;
}

const HeroCtx = createContext<HeroCtxValue>({ isHero: false, setIsHero: () => {} });

export function HeroProvider({ children }: { children: React.ReactNode }) {
  const [isHero, setIsHero] = useState(false);
  return <HeroCtx.Provider value={{ isHero, setIsHero }}>{children}</HeroCtx.Provider>;
}

export function useHeroCtx() {
  return useContext(HeroCtx);
}

/**
 * Вставь <HeroHeader /> в любую страницу с фоновым фото.
 * Хедер автоматически станет прозрачным.
 */
export function HeroHeader() {
  const { setIsHero } = useContext(HeroCtx);
  useEffect(() => {
    setIsHero(true);
    return () => setIsHero(false);
  }, [setIsHero]);
  return null;
}
