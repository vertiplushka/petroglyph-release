"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPartners, deletePartner, Partner } from "@/lib/admin-api";
import { Plus, Pencil, Trash2, Handshake, MapPin, Phone, Mail } from "lucide-react";

function TableSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="bg-white border border-[#e8e4d8] rounded-2xl overflow-hidden">
        <div className="h-10 bg-[#faf8f2] border-b border-[#e8e4d8]" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-[#e8e4d8] last:border-0">
            <div className="size-10 rounded-xl bg-[#f0ece0] shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 bg-[#ede9de] rounded w-2/5" />
              <div className="h-2.5 bg-[#f0ece0] rounded w-1/3" />
            </div>
            <div className="h-3 w-24 bg-[#f5f2e8] rounded hidden md:block" />
            <div className="h-3 w-32 bg-[#f5f2e8] rounded hidden lg:block" />
            <div className="size-7 bg-[#f5f2e8] rounded-lg ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    getPartners()
      .then(setPartners)
      .catch(() => setError("Не удалось загрузить партнёров"))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Удалить партнёра «${name}»? Его места останутся, но будут отвязаны.`)) return;
    setDeletingId(id);
    try {
      await deletePartner(id);
      setPartners((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Не удалось удалить партнёра");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-[#0e0f11] text-[1.85rem] font-semibold leading-tight">Партнёры</h1>
          {!loading && (
            <p className="text-[#888] text-sm mt-1.5">
              {partners.length}{" "}
              {partners.length === 1 ? "партнёр" : partners.length < 5 ? "партнёра" : "партнёров"} в
              базе
            </p>
          )}
        </div>
        <Link
          href="/admin/partners/new"
          className="flex items-center gap-2 bg-[#233516] text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-[#2c4219] active:scale-[0.98] transition-all"
        >
          <Plus size={15} />
          Добавить партнёра
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 rounded-xl px-4 py-3 text-sm mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <TableSkeleton />
      ) : partners.length === 0 ? (
        <div className="bg-white border border-[#e8e4d8] rounded-2xl flex flex-col items-center py-20">
          <div className="size-16 rounded-2xl bg-[#f5f2e8] flex items-center justify-center mb-4">
            <Handshake size={26} className="text-[#bbb]" strokeWidth={1.5} />
          </div>
          <h3 className="text-[#0e0f11] text-xl font-semibold mb-2">Партнёров пока нет</h3>
          <p className="text-[#888] text-sm mb-7">Добавьте первого партнёра</p>
          <Link
            href="/admin/partners/new"
            className="inline-flex items-center gap-2 bg-[#233516] text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-[#2c4219] transition-colors"
          >
            <Plus size={15} />
            Добавить партнёра
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-[#e8e4d8] rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e8e4d8] bg-[#faf8f2]">
                <th className="text-left text-[#888] font-semibold px-5 py-3 text-[11px] tracking-wider uppercase">
                  Компания
                </th>
                <th className="text-left text-[#888] font-semibold px-5 py-3 text-[11px] tracking-wider uppercase hidden md:table-cell">
                  Контакт
                </th>
                <th className="text-left text-[#888] font-semibold px-5 py-3 text-[11px] tracking-wider uppercase hidden lg:table-cell">
                  Email
                </th>
                <th className="text-left text-[#888] font-semibold px-5 py-3 text-[11px] tracking-wider uppercase hidden xl:table-cell">
                  Мест
                </th>
                <th className="w-20 px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {partners.map((partner) => (
                <tr
                  key={partner.id}
                  className="border-b border-[#e8e4d8] last:border-0 hover:bg-[#fdfbf5] transition-colors group"
                >
                  {/* Company */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-xl bg-[#233516]/8 flex items-center justify-center shrink-0">
                        <Handshake size={15} className="text-[#233516]" strokeWidth={1.75} />
                      </div>
                      <div>
                        <div className="text-[#0e0f11] font-medium text-[13px]">
                          {partner.companyName}
                        </div>
                        <div className="text-[#aaa] text-[11px] mt-0.5">
                          ИНН {partner.inn}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-5 py-4 hidden md:table-cell">
                    <div className="text-[#0e0f11] text-[13px]">{partner.contactPerson}</div>
                    <div className="flex items-center gap-1 text-[#aaa] text-[11px] mt-0.5">
                      <Phone size={10} />
                      {partner.phone}
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <div className="flex items-center gap-1.5 text-[#555] text-[13px]">
                      <Mail size={12} className="text-[#aaa]" />
                      {partner.email}
                    </div>
                  </td>

                  {/* Places count */}
                  <td className="px-5 py-4 hidden xl:table-cell">
                    <div className="flex items-center gap-1.5 text-[#555] text-[13px]">
                      <MapPin size={12} className="text-[#aaa]" />
                      {partner.places?.length ?? 0}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/admin/partners/${partner.id}/edit`}
                        className="p-2 rounded-lg text-[#999] hover:text-[#233516] hover:bg-[#233516]/8 transition-colors"
                        title="Редактировать"
                      >
                        <Pencil size={14} />
                      </Link>
                      <button
                        onClick={() => handleDelete(partner.id, partner.companyName)}
                        disabled={deletingId === partner.id}
                        className="p-2 rounded-lg text-[#999] hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                        title="Удалить"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
