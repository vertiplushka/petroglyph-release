"use client";

import dynamic from "next/dynamic";
import type { Place } from "@/lib/server-api";

const AltaiMapInner = dynamic(() => import("./altai-map-inner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full rounded-2xl bg-[#eef2ea] flex items-center justify-center">
      <p className="text-[#233516]/40 font-sans text-sm">Загрузка карты…</p>
    </div>
  ),
});

export default function AltaiMap({ highlightedIds, places }: { highlightedIds: number[]; places: Place[] }) {
  return <AltaiMapInner highlightedIds={highlightedIds} places={places} />;
}
