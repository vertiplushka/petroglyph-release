"use client";

import dynamic from "next/dynamic";

const PlaceMapInner = dynamic(() => import("./place-map-inner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full rounded-3xl bg-[#eef2ea] flex items-center justify-center">
      <p className="text-[#233516]/40 font-sans text-sm">Загрузка карты…</p>
    </div>
  ),
});

interface Props {
  lat: number;
  lng: number;
  name: string;
}

export default function PlaceMap({ lat, lng, name }: Props) {
  return <PlaceMapInner lat={lat} lng={lng} name={name} />;
}
