"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPartner, Partner } from "@/lib/admin-api";
import PartnerForm from "@/components/admin/partner-form";

export default function EditPartnerPage() {
  const { id } = useParams<{ id: string }>();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getPartner(Number(id))
      .then(setPartner)
      .catch(() => setError("Не удалось загрузить данные партнёра"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="size-6 border-2 border-[#233516]/30 border-t-[#233516] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-100 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error || "Партнёр не найден"}
        </div>
      </div>
    );
  }

  return <PartnerForm initial={partner} mode="edit" />;
}
