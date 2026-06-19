"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getRoutes, deleteRoute, Route } from "@/lib/admin-api";
import { Plus, Pencil, Trash2, Route as RouteIcon } from "lucide-react";

function TableSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-white border border-[#e8e4d8] rounded-2xl overflow-hidden">
        <div className="h-10 bg-[#faf8f2] border-b border-[#e8e4d8]" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-[#e8e4d8] last:border-0">
            <div className="size-10 rounded-xl bg-[#f0ece0] shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 bg-[#ede9de] rounded w-1/3" />
              <div className="h-2.5 bg-[#f0ece0] rounded w-1/2" />
            </div>
            <div className="size-7 bg-[#f5f2e8] rounded-lg ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminRoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    getRoutes()
      .then(setRoutes)
      .catch(() => setError("Не удалось загрузить маршруты"))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: number, title: string) {
    if (!confirm(`Удалить маршрут «${title}»?`)) return;
    setDeletingId(id);
    try {
      await deleteRoute(id);
      setRoutes((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert("Не удалось удалить маршрут");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-[#0e0f11] text-[1.85rem] font-semibold leading-tight">Маршруты</h1>
          {!loading && (
            <p className="text-[#888] text-sm mt-1.5">{routes.length} маршрутов в базе данных</p>
          )}
        </div>
        <Link
          href="/admin/routes/new"
          className="flex items-center gap-2 bg-[#233516] text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-[#2c4219] active:scale-[0.98] transition-all"
        >
          <Plus size={15} />
          Добавить маршрут
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 rounded-xl px-4 py-3 text-sm mb-6">{error}</div>
      )}

      {loading ? <TableSkeleton /> : routes.length === 0 ? (
        <div className="bg-white border border-[#e8e4d8] rounded-2xl flex flex-col items-center py-20">
          <div className="size-16 rounded-2xl bg-[#f5f2e8] flex items-center justify-center mb-4">
            <RouteIcon size={26} className="text-[#bbb]" strokeWidth={1.5} />
          </div>
          <h3 className="text-[#0e0f11] text-xl font-semibold mb-2">Маршрутов пока нет</h3>
          <p className="text-[#888] text-sm mb-7">Создайте первый туристический маршрут</p>
          <Link
            href="/admin/routes/new"
            className="inline-flex items-center gap-2 bg-[#233516] text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-[#2c4219] transition-colors"
          >
            <Plus size={15} />
            Добавить маршрут
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-[#e8e4d8] rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e8e4d8] bg-[#faf8f2]">
                <th className="w-16 px-4 py-3" />
                <th className="text-left text-[#888] font-semibold px-4 py-3 text-[11px] tracking-wider uppercase">Название</th>
                <th className="text-left text-[#888] font-semibold px-4 py-3 text-[11px] tracking-wider uppercase hidden lg:table-cell">Путь</th>
                <th className="text-left text-[#888] font-semibold px-4 py-3 text-[11px] tracking-wider uppercase hidden xl:table-cell">Теги</th>
                <th className="w-20 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {routes.map((route) => (
                <tr key={route.id} className="border-b border-[#e8e4d8] last:border-0 hover:bg-[#fdfbf5] transition-colors group">
                  <td className="px-4 py-3">
                    {route.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={route.image} alt={route.title} className="size-10 rounded-xl object-cover border border-[#e8e4d8]" />
                    ) : (
                      <div className="size-10 rounded-xl bg-[#f0ece0] flex items-center justify-center">
                        <RouteIcon size={13} className="text-[#c0bab0]" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-[#0e0f11] font-medium text-[13px] max-w-[220px] truncate">{route.title}</div>
                    <div className="text-[#aaa] text-[11px] mt-0.5 max-w-[220px] truncate">{route.subtitle}</div>
                  </td>
                  <td className="px-4 py-3 text-[#666] text-[13px] hidden lg:table-cell max-w-[200px]">
                    <span className="truncate block">{route.path}</span>
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {route.tags.slice(0, 3).map((t) => (
                        <span key={t} className="bg-[#233516]/8 text-[#233516] text-[10px] font-semibold px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/admin/routes/${route.id}/edit`}
                        className="p-2 rounded-lg text-[#999] hover:text-[#233516] hover:bg-[#233516]/8 transition-colors"
                      >
                        <Pencil size={14} />
                      </Link>
                      <button
                        onClick={() => handleDelete(route.id, route.title)}
                        disabled={deletingId === route.id}
                        className="p-2 rounded-lg text-[#999] hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
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
