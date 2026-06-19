"use client";

import { useEffect, useState } from "react";
import {
  getReviews,
  approveReview,
  rejectReview,
  deleteReview,
  Review,
  ReviewStatus,
} from "@/lib/admin-api";
import { Check, X, Trash2, MessageSquare, Star, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<ReviewStatus, string> = {
  pending: "Ожидает",
  approved: "Одобрен",
  rejected: "Отклонён",
};

const STATUS_CLS: Record<ReviewStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  rejected: "bg-red-50 text-red-600 border border-red-200",
};

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={11}
          className={i <= rating ? "text-amber-400 fill-amber-400" : "text-[#e0dbd0]"}
        />
      ))}
    </span>
  );
}

function ReviewSkeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white border border-[#e8e4d8] rounded-2xl p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="space-y-1.5">
              <div className="h-3.5 bg-[#ede9de] rounded w-28" />
              <div className="h-2.5 bg-[#f0ece0] rounded w-20" />
            </div>
            <div className="h-6 bg-[#f5f2e8] rounded-full w-20" />
          </div>
          <div className="space-y-1.5">
            <div className="h-3 bg-[#f0ece0] rounded w-full" />
            <div className="h-3 bg-[#f0ece0] rounded w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<ReviewStatus | "all">("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actingId, setActingId] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = filter !== "all" ? { status: filter as ReviewStatus } : undefined;
    getReviews(params)
      .then(setReviews)
      .catch(() => setError("Не удалось загрузить отзывы"))
      .finally(() => setLoading(false));
  }, [filter]);

  async function handleApprove(id: number) {
    setActingId(id);
    try {
      const updated = await approveReview(id);
      setReviews((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch {
      alert("Не удалось одобрить отзыв");
    } finally {
      setActingId(null);
    }
  }

  async function handleReject(id: number) {
    setActingId(id);
    try {
      const updated = await rejectReview(id);
      setReviews((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch {
      alert("Не удалось отклонить отзыв");
    } finally {
      setActingId(null);
    }
  }

  async function handleDelete(id: number, author: string) {
    if (!confirm(`Удалить отзыв от «${author}»?`)) return;
    setActingId(id);
    try {
      await deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert("Не удалось удалить отзыв");
    } finally {
      setActingId(null);
    }
  }

  const tabs: { value: ReviewStatus | "all"; label: string }[] = [
    { value: "pending", label: "Ожидают" },
    { value: "approved", label: "Одобренные" },
    { value: "rejected", label: "Отклонённые" },
    { value: "all", label: "Все" },
  ];

  const pendingCount = reviews.filter((r) => r.status === "pending").length;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-[#0e0f11] text-[1.85rem] font-semibold leading-tight">Отзывы</h1>
          {!loading && (
            <p className="text-[#888] text-sm mt-1.5">
              {reviews.length} {filter === "all" ? "отзывов всего" : "отзывов в выборке"}
              {filter === "all" && pendingCount > 0 && (
                <span className="ml-2 inline-flex items-center bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {pendingCount} ожидают модерации
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 bg-white border border-[#e8e4d8] rounded-xl p-1 w-fit mb-6">
        <Filter size={13} className="text-[#bbb] ml-2 mr-1" />
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all",
              filter === tab.value
                ? "bg-[#233516] text-white shadow-sm"
                : "text-[#888] hover:text-[#0e0f11] hover:bg-[#f5f2e8]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 rounded-xl px-4 py-3 text-sm mb-6">{error}</div>
      )}

      {loading ? (
        <ReviewSkeleton />
      ) : reviews.length === 0 ? (
        <div className="bg-white border border-[#e8e4d8] rounded-2xl flex flex-col items-center py-20">
          <div className="size-16 rounded-2xl bg-[#f5f2e8] flex items-center justify-center mb-4">
            <MessageSquare size={26} className="text-[#bbb]" strokeWidth={1.5} />
          </div>
          <h3 className="text-[#0e0f11] text-xl font-semibold mb-2">Отзывов нет</h3>
          <p className="text-[#888] text-sm">В этой категории пока нет отзывов</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className={cn(
                "bg-white border rounded-2xl p-5 transition-all",
                review.status === "pending" ? "border-amber-200 bg-amber-50/30" : "border-[#e8e4d8]"
              )}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-start gap-3">
                  <div className="size-9 rounded-full bg-[#f0ece0] flex items-center justify-center shrink-0 text-[#888] text-sm font-bold mt-0.5">
                    {review.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[#0e0f11] font-semibold text-[14px]">{review.author}</span>
                      <Stars rating={review.rating} />
                      <span
                        className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide",
                          STATUS_CLS[review.status]
                        )}
                      >
                        {STATUS_LABELS[review.status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#aaa]">
                      <span>{review.date}</span>
                      {review.placeId && (
                        <span className="bg-[#233516]/8 text-[#233516] text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          Место #{review.placeId}
                        </span>
                      )}
                      {review.routeId && (
                        <span className="bg-[#233516]/8 text-[#233516] text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          Маршрут #{review.routeId}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {review.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleApprove(review.id)}
                        disabled={actingId === review.id}
                        title="Одобрить"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[12px] font-semibold transition-colors disabled:opacity-50"
                      >
                        <Check size={12} />
                        Одобрить
                      </button>
                      <button
                        onClick={() => handleReject(review.id)}
                        disabled={actingId === review.id}
                        title="Отклонить"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f5f2e8] hover:bg-red-50 text-[#888] hover:text-red-600 border border-[#e8e4d8] hover:border-red-200 rounded-lg text-[12px] font-semibold transition-colors disabled:opacity-50"
                      >
                        <X size={12} />
                        Отклонить
                      </button>
                    </>
                  )}
                  {review.status === "approved" && (
                    <button
                      onClick={() => handleReject(review.id)}
                      disabled={actingId === review.id}
                      className="px-3 py-1.5 bg-[#f5f2e8] hover:bg-red-50 text-[#888] hover:text-red-600 border border-[#e8e4d8] hover:border-red-200 rounded-lg text-[12px] font-semibold transition-colors disabled:opacity-50"
                    >
                      Отклонить
                    </button>
                  )}
                  {review.status === "rejected" && (
                    <button
                      onClick={() => handleApprove(review.id)}
                      disabled={actingId === review.id}
                      className="px-3 py-1.5 bg-[#f5f2e8] hover:bg-emerald-50 text-[#888] hover:text-emerald-700 border border-[#e8e4d8] hover:border-emerald-200 rounded-lg text-[12px] font-semibold transition-colors disabled:opacity-50"
                    >
                      Одобрить
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(review.id, review.author)}
                    disabled={actingId === review.id}
                    title="Удалить"
                    className="p-2 rounded-lg text-[#bbb] hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <p className="text-[#444] text-sm leading-relaxed pl-12">{review.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
