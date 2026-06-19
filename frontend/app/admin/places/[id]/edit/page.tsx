"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPlace, Place } from "@/lib/admin-api";
import PlaceForm from "@/components/admin/place-form";

export default function EditPlacePage() {
  const { id } = useParams<{ id: string }>();
  const [place, setPlace] = useState<Place | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getPlace(Number(id))
      .then(setPlace)
      .catch(() => setError("Место не найдено"));
  }, [id]);

  if (error) {
    return (
      <div className="p-8 text-red-600 text-sm">{error}</div>
    );
  }

  if (!place) {
    return <div className="p-8 text-[#666] text-sm">Загрузка...</div>;
  }

  return <PlaceForm mode="edit" initial={place} />;
}
