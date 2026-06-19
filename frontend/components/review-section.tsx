"use client";

import { useEffect, useState } from "react";
import { submitReview, getPublicReviews, Review } from "@/lib/admin-api";
import { Star, Send, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  placeId?: number;
  routeId?: number;
}

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            size={22}
            className={cn(
              "transition-colors",
              i <= (hovered || value)
                ? "text-amber-400 fill-amber-400"
                : "text-[#d8d2c6]"
            )}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="flex gap-4">
      <div className="size-9 rounded-full bg-[#f0ece0] flex items-center justify-center shrink-0 text-[#888] text-sm font-bold mt-0.5">
        {review.author.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-[#0e0f11] font-semibold text-[14px]">{review.author}</span>
          <span className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={11}
                className={i <= review.rating ? "text-amber-400 fill-amber-400" : "text-[#e0dbd0]"}
              />
            ))}
          </span>
          <span className="text-[#bbb] text-[11px]">{review.date}</span>
        </div>
        <p className="text-[#555] text-[14px] leading-relaxed">{review.text}</p>
      </div>
    </div>
  );
}

export default function ReviewSection({ placeId, routeId }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");

  useEffect(() => {
    getPublicReviews({ placeId, routeId })
      .then(setReviews)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [placeId, routeId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) { setError("Пожалуйста, поставьте оценку"); return; }
    setError("");
    setSending(true);
    try {
      await submitReview({ author, rating, text, placeId, routeId });
      setSubmitted(true);
      setAuthor("");
      setRating(0);
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка отправки");
    } finally {
      setSending(false);
    }
  }

  const inputCls =
    "w-full bg-white border border-[#e2ddd0] rounded-xl px-3.5 py-2.5 text-[#0e0f11] text-sm outline-none focus:border-[#233516] transition-colors placeholder:text-[#c4bfb2]";

  return (
    <div className="mt-12">
      <h2 className="text-[#0e0f11] text-2xl font-semibold mb-6">Отзывы</h2>

      {/* Approved reviews */}
      {loading ? (
        <div className="flex flex-col gap-5 mb-10">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="size-9 rounded-full bg-[#f0ece0] shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-[#ede9de] rounded w-28" />
                <div className="h-3 bg-[#f0ece0] rounded w-full" />
                <div className="h-3 bg-[#f0ece0] rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="flex flex-col gap-6 mb-10">
          {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
        </div>
      ) : (
        <p className="text-[#bbb] text-sm mb-8">Отзывов пока нет. Будьте первым!</p>
      )}

      {/* Submit form */}
      <div className="bg-[#faf8f2] border border-[#e8e4d8] rounded-2xl p-6">
        <h3 className="text-[#0e0f11] font-semibold text-[15px] mb-4">Оставить отзыв</h3>

        {submitted ? (
          <div className="flex items-center gap-3 text-emerald-700">
            <CheckCircle size={20} />
            <div>
              <p className="font-semibold text-[14px]">Отзыв отправлен!</p>
              <p className="text-[13px] text-emerald-600 mt-0.5">Он появится после проверки модератором.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className={inputCls}
              required
              placeholder="Ваше имя"
            />
            <div>
              <p className="text-xs font-semibold text-[#888] mb-1.5">Оценка</p>
              <StarRating value={rating} onChange={setRating} />
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className={cn(inputCls, "resize-y min-h-[90px]")}
              required
              placeholder="Поделитесь впечатлениями..."
            />
            {error && <p className="text-red-600 text-xs">{error}</p>}
            <button
              type="submit"
              disabled={sending}
              className="self-start flex items-center gap-2 bg-[#233516] text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-[#2c4219] active:scale-[0.99] transition-all disabled:opacity-60"
            >
              <Send size={13} />
              {sending ? "Отправка..." : "Отправить отзыв"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
