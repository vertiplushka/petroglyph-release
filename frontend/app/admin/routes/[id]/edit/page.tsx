"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getRouteAdmin, Route } from "@/lib/admin-api";
import RouteForm from "@/components/admin/route-form";

export default function EditRoutePage() {
  const { id } = useParams<{ id: string }>();
  const [route, setRoute] = useState<Route | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getRouteAdmin(Number(id))
      .then(setRoute)
      .catch(() => setError("Не удалось загрузить маршрут"));
  }, [id]);

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-100 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
      </div>
    );
  }

  if (!route) {
    return (
      <div className="p-8 flex items-center gap-3 text-[#888] text-sm">
        <div className="size-4 border-2 border-[#233516]/30 border-t-[#233516] rounded-full animate-spin" />
        Загрузка...
      </div>
    );
  }

  return <RouteForm mode="edit" initial={route} />;
}
