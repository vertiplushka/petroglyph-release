"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getPartnerPlace,
  updatePartnerPlace,
  uploadPartnerMedia,
  PartnerPlaceFull,
  decodePartnerToken,
} from "@/lib/partner-api";
import {
  ChevronLeft, Save, Upload, Loader2, Trash2, Film,
  Star, Tag, Plus, X, ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const inputCls =
  "w-full bg-white border border-[#e2ddd0] rounded-xl px-3.5 py-2.5 text-[#0e0f11] text-sm outline-none focus:border-[#233516] transition-colors placeholder:text-[#c4bfb2]";
const sectionLabel =
  "text-[10px] font-bold tracking-[0.14em] uppercase text-[#aaa] mb-3";

type MediaItem = { type: "image" | "video"; url: string };

type FormData = {
  name: string;
  category: string;
  description: string;
  price: string;
  rating: number;
  tags: string[];
  image: string;
  images: MediaItem[];
  lat: number;
  lng: number;
};

export default function PartnerPlaceEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormData | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    const decoded = decodePartnerToken();
    if (!decoded) { router.push("/login/partner"); return; }

    getPartnerPlace(Number(id))
      .then((place) => {
        setForm({
          name: place.name,
          category: place.category,
          description: place.description,
          price: place.price,
          rating: place.rating,
          tags: place.tags ?? [],
          image: place.image ?? "",
          images: place.images ?? [],
          lat: place.lat,
          lng: place.lng,
        });
      })
      .catch(() => setLoadError("Не удалось загрузить данные объекта"));
  }, [id, router]);

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => prev ? { ...prev, [key]: value } : prev);
  }

  function addTag() {
    const tag = tagInput.trim();
    if (!tag || !form || form.tags.includes(tag)) return;
    set("tags", [...form.tags, tag]);
    setTagInput("");
  }

  function removeTag(tag: string) {
    if (!form) return;
    set("tags", form.tags.filter((t) => t !== tag));
  }

  function removeMedia(idx: number) {
    if (!form) return;
    set("images", form.images.filter((_, i) => i !== idx));
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length || !form) return;
    setUploading(true);
    setUploadError("");
    try {
      const results = await Promise.all(files.map(uploadPartnerMedia));
      const newImages = [...form.images, ...results];
      set("images", newImages);
      if (!form.image && results[0]?.type === "image") set("image", results[0].url);
    } catch {
      setUploadError("Ошибка загрузки файла");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaveError("");
    setSaving(true);
    try {
      await updatePartnerPlace(Number(id), form);
      router.push("/partner/profile");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-[#fffcf3] flex items-center justify-center">
        <div className="bg-red-50 border border-red-100 text-red-700 rounded-xl px-5 py-4 text-sm max-w-sm text-center">
          {loadError}
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-[#fffcf3] flex items-center justify-center">
        <div className="size-8 border-2 border-[#233516]/20 border-t-[#233516] rounded-full animate-spin" />
      </div>
    );
  }

  const ratingStars = Math.round(form.rating);

  return (
    <form onSubmit={handleSubmit} className="min-h-screen bg-[#fffcf3] flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-[#fffcf3] border-b border-[#e8e4d8] px-6 py-4 flex items-center gap-4">
        <Link
          href="/partner/profile"
          className="p-2 rounded-xl text-[#888] hover:text-[#233516] hover:bg-[#233516]/8 transition-colors"
        >
          <ChevronLeft size={18} />
        </Link>
        <h1 className="text-[#0e0f11] text-xl font-semibold flex-1 truncate">
          {form.name || "Редактировать объект"}
        </h1>
      </div>

      {/* Body */}
      <div className="flex-1 p-6">
        <div className="max-w-[900px] mx-auto grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5">

          {/* Left */}
          <div className="flex flex-col gap-5">

            {/* Основное */}
            <div className="bg-white border border-[#e8e4d8] rounded-2xl p-6">
              <p className={sectionLabel}>Основная информация</p>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#555]">Название</label>
                    <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)}
                      className={inputCls} required placeholder="Название объекта" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#555]">Категория</label>
                    <input type="text" value={form.category} onChange={(e) => set("category", e.target.value)}
                      className={inputCls} required placeholder="Природа, Отдых..." />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#555]">Цена</label>
                    <input type="text" value={form.price} onChange={(e) => set("price", e.target.value)}
                      className={inputCls} required placeholder="от 500 ₽" />
                  </div>
                </div>
              </div>
            </div>

            {/* Описание */}
            <div className="bg-white border border-[#e8e4d8] rounded-2xl p-6">
              <p className={sectionLabel}>Описание</p>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                className={cn(inputCls, "resize-y min-h-[140px]")}
                required
                placeholder="Подробное описание объекта..."
              />
            </div>

            {/* Медиа */}
            <div className="bg-white border border-[#e8e4d8] rounded-2xl p-6">
              <p className={sectionLabel}>Фотографии</p>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-xl p-5 flex flex-col items-center gap-2 cursor-pointer transition-colors mb-4",
                  uploading ? "border-[#233516]/30 bg-[#f5f2e8]" : "border-[#e2ddd0] hover:border-[#233516]/40 hover:bg-[#faf8f2]"
                )}
              >
                {uploading
                  ? <><Loader2 size={22} className="text-[#233516] animate-spin" /><p className="text-sm text-[#555]">Загрузка...</p></>
                  : <><Upload size={20} className="text-[#bbb]" strokeWidth={1.5} /><p className="text-sm text-[#555] font-medium">Нажмите для выбора фото</p><p className="text-xs text-[#aaa]">JPG, PNG, WebP, MP4</p></>
                }
                <input ref={fileInputRef} type="file" multiple accept="image/*,video/*"
                  className="hidden" onChange={handleFileChange} disabled={uploading} />
              </div>
              {uploadError && <p className="text-red-600 text-xs mb-3">{uploadError}</p>}
              {form.images.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {form.images.map((item, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-[#e8e4d8] aspect-square bg-[#f5f2e8]">
                      {item.type === "video"
                        ? <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-[#aaa]"><Film size={20} strokeWidth={1.5} /><span className="text-[10px]">видео</span></div>
                        // eslint-disable-next-line @next/next/no-img-element
                        : <img src={item.url} alt="" className="w-full h-full object-cover" />
                      }
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5">
                        {item.type === "image" && (
                          <button type="button" onClick={() => set("image", item.url)}
                            className={cn("text-[10px] font-semibold px-2 py-1 rounded-lg transition-colors",
                              form.image === item.url ? "bg-[#233516] text-white" : "bg-white/90 text-[#0e0f11] hover:bg-white")}>
                            {form.image === item.url ? "✓ Обложка" : "Обложка"}
                          </button>
                        )}
                        <button type="button" onClick={() => removeMedia(idx)}
                          className="bg-red-500 text-white p-1 rounded-lg hover:bg-red-600 transition-colors">
                          <Trash2 size={11} />
                        </button>
                      </div>
                      {form.image === item.url && (
                        <div className="absolute top-1 left-1 bg-[#233516] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">ОБЛОЖКА</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4">
                <p className="text-xs font-semibold text-[#555] mb-1.5">Или URL обложки</p>
                <input type="text" value={form.image} onChange={(e) => set("image", e.target.value)}
                  className={inputCls} placeholder="https://..." />
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="flex flex-col gap-5">

            {/* Рейтинг */}
            <div className="bg-white border border-[#e8e4d8] rounded-2xl p-6">
              <p className={sectionLabel}>Рейтинг</p>
              <div className="flex items-center justify-between mb-3">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={22}
                      className={s <= ratingStars ? "text-amber-400 fill-amber-400" : "text-[#e0dbd2] fill-[#e0dbd2]"} />
                  ))}
                </div>
                <span className="text-[#0e0f11] text-2xl font-semibold tabular-nums">{form.rating.toFixed(1)}</span>
              </div>
              <input type="range" min={0} max={5} step={0.1} value={form.rating}
                onChange={(e) => set("rating", parseFloat(e.target.value))}
                className="w-full accent-[#233516] h-1.5" />
              <div className="flex justify-between text-[10px] text-[#ccc] mt-1.5 font-medium">
                <span>0.0</span><span>5.0</span>
              </div>
            </div>

            {/* Координаты */}
            <div className="bg-white border border-[#e8e4d8] rounded-2xl p-6">
              <p className={sectionLabel}>Координаты</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#555]">Широта</label>
                  <input type="number" value={form.lat}
                    onChange={(e) => set("lat", parseFloat(e.target.value))}
                    className={inputCls} step="any" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#555]">Долгота</label>
                  <input type="number" value={form.lng}
                    onChange={(e) => set("lng", parseFloat(e.target.value))}
                    className={inputCls} step="any" />
                </div>
              </div>
            </div>

            {/* Теги */}
            <div className="bg-white border border-[#e8e4d8] rounded-2xl p-6">
              <p className={cn(sectionLabel, "flex items-center gap-1.5")}><Tag size={10} />Теги</p>
              <div className="flex gap-2 mb-3">
                <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                  className={cn(inputCls, "flex-1")} placeholder="Введите тег..." />
                <button type="button" onClick={addTag}
                  className="px-3 py-2.5 bg-[#233516]/8 hover:bg-[#233516]/14 text-[#233516] rounded-xl transition-colors">
                  <Plus size={15} />
                </button>
              </div>
              {form.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {form.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 bg-[#233516]/8 text-[#233516] text-xs font-semibold px-2.5 py-1 rounded-full">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)}
                        className="text-[#233516]/50 hover:text-red-500 transition-colors ml-0.5">
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[#c4bfb2] text-xs">Нет тегов</p>
              )}
            </div>

            {/* Превью обложки */}
            {form.image && (
              <div className="bg-white border border-[#e8e4d8] rounded-2xl overflow-hidden">
                <div className="px-5 pt-5 pb-2">
                  <p className={cn(sectionLabel, "mb-0 flex items-center gap-1.5")}><ImageIcon size={10} />Обложка</p>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.image} alt="cover" className="w-full h-48 object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="sticky bottom-0 bg-[#fffcf3] border-t border-[#e8e4d8] px-6 py-4">
        {saveError && (
          <div className="bg-red-50 border border-red-100 text-red-700 rounded-xl px-4 py-2.5 text-sm mb-4">
            {saveError}
          </div>
        )}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving || uploading}
            className="flex items-center gap-2 bg-[#233516] text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-[#2c4219] active:scale-[0.99] transition-all disabled:opacity-60">
            <Save size={14} />
            {saving ? "Сохранение..." : "Сохранить"}
          </button>
          <Link href="/partner/profile"
            className="px-5 py-2.5 text-sm font-medium text-[#888] hover:text-[#0e0f11] transition-colors">
            Отмена
          </Link>
        </div>
      </div>
    </form>
  );
}
