"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Route, MediaItem, createRoute, updateRoute, uploadMedia } from "@/lib/admin-api";
import { Plus, X, ChevronLeft, Save, ImageIcon, Tag, Upload, Loader2, Film, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type FormData = Omit<Route, "id"> & { id: number | "" };

const EMPTY: FormData = {
  id: "",
  title: "",
  subtitle: "",
  path: "",
  description: "",
  tags: [],
  image: "",
  images: [],
};

const inputCls =
  "w-full bg-white border border-[#e2ddd0] rounded-xl px-3.5 py-2.5 text-[#0e0f11] text-sm outline-none focus:border-[#233516] transition-colors placeholder:text-[#c4bfb2]";

const sectionLabel = "text-[10px] font-bold tracking-[0.14em] uppercase text-[#aaa] mb-3";

interface Props {
  initial?: Route;
  mode: "create" | "edit";
}

export default function RouteForm({ initial, mode }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormData>(
    initial ? { ...initial, images: initial.images ?? [] } : EMPTY
  );
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addTag() {
    const tag = tagInput.trim();
    if (!tag || form.tags.includes(tag)) return;
    set("tags", [...form.tags, tag]);
    setTagInput("");
  }

  function removeTag(tag: string) {
    set("tags", form.tags.filter((t) => t !== tag));
  }

  function removeMedia(idx: number) {
    set("images", form.images.filter((_, i) => i !== idx));
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    setUploadError("");
    try {
      const results = await Promise.all(files.map((f) => uploadMedia(f)));
      const newImages = [...form.images, ...results];
      set("images", newImages);
      if (!form.image && results[0]?.type === "image") set("image", results[0].url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Ошибка загрузки");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function setCover(item: MediaItem) {
    if (item.type === "image") set("image", item.url);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (mode === "create") {
        await createRoute({ ...form, id: Number(form.id) } as Route);
      } else {
        const { id, ...rest } = form;
        await updateRoute(Number(id), rest);
      }
      router.push("/admin/routes");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col min-h-screen">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-[#fffcf3] border-b border-[#e8e4d8] px-6 lg:px-8 py-4 flex items-center gap-4">
        <Link href="/admin/routes" className="p-2 rounded-xl text-[#888] hover:text-[#233516] hover:bg-[#233516]/8 transition-colors">
          <ChevronLeft size={18} />
        </Link>
        <h1 className="text-[#0e0f11] text-xl font-semibold">
          {mode === "create" ? "Новый маршрут" : "Редактировать маршрут"}
        </h1>
      </div>

      <div className="flex-1 p-6 lg:p-8">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">

          {/* Left */}
          <div className="flex flex-col gap-5">
            {/* Basic info */}
            <div className="bg-white border border-[#e8e4d8] rounded-2xl p-6">
              <p className={sectionLabel}>Основная информация</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#555]">ID</label>
                  <input
                    type="number"
                    value={form.id}
                    onChange={(e) => set("id", e.target.value === "" ? "" : Number(e.target.value))}
                    className={inputCls}
                    disabled={mode === "edit"}
                    required
                    min={1}
                    placeholder="1"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#555]">Маршрут (путь)</label>
                  <input
                    type="text"
                    value={form.path}
                    onChange={(e) => set("path", e.target.value)}
                    className={inputCls}
                    required
                    placeholder="Горно-Алтайск — Белуха"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 mb-4">
                <label className="text-xs font-semibold text-[#555]">Название</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  className={inputCls}
                  required
                  placeholder="«Где Алтай дышит тише»"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#555]">Подзаголовок</label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => set("subtitle", e.target.value)}
                  className={inputCls}
                  required
                  placeholder="Краткое описание маршрута"
                />
              </div>
            </div>

            {/* Description */}
            <div className="bg-white border border-[#e8e4d8] rounded-2xl p-6">
              <p className={sectionLabel}>Описание</p>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                className={cn(inputCls, "resize-y min-h-[140px]")}
                required
                placeholder="Подробное описание маршрута..."
              />
            </div>

            {/* Media */}
            <div className="bg-white border border-[#e8e4d8] rounded-2xl p-6">
              <p className={sectionLabel}>Медиагалерея</p>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors mb-4",
                  uploading ? "border-[#233516]/30 bg-[#f5f2e8]" : "border-[#e2ddd0] hover:border-[#233516]/40 hover:bg-[#faf8f2]"
                )}
              >
                {uploading ? (
                  <><Loader2 size={24} className="text-[#233516] animate-spin" /><p className="text-sm text-[#555]">Загрузка...</p></>
                ) : (
                  <>
                    <Upload size={22} className="text-[#bbb]" strokeWidth={1.5} />
                    <p className="text-sm text-[#555] font-medium">Нажмите для выбора файлов</p>
                    <p className="text-xs text-[#aaa]">JPG, PNG, WebP, MP4, MOV — до 100 МБ</p>
                    <div className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-0.5 text-[11px] text-[#bbb]">
                      <span>Соотношение сторон: 16:9 (горизонталь)</span>
                      <span>Минимум: 1920 × 1080 пкс</span>
                    </div>
                  </>
                )}
                <input ref={fileInputRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
              </div>
              {uploadError && <p className="text-red-600 text-xs mb-3">{uploadError}</p>}
              {form.images.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {form.images.map((item, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-[#e8e4d8] aspect-square bg-[#f5f2e8]">
                      {item.type === "video" ? (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-[#aaa]">
                          <Film size={20} strokeWidth={1.5} /><span className="text-[10px]">видео</span>
                        </div>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.url} alt="" className="w-full h-full object-cover" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5">
                        {item.type === "image" && (
                          <button type="button" onClick={() => setCover(item)}
                            className={cn("text-[10px] font-semibold px-2 py-1 rounded-lg transition-colors",
                              form.image === item.url ? "bg-[#233516] text-white" : "bg-white/90 text-[#0e0f11] hover:bg-white"
                            )}>
                            {form.image === item.url ? "✓ Обложка" : "Обложка"}
                          </button>
                        )}
                        <button type="button" onClick={() => removeMedia(idx)} className="bg-red-500 text-white p-1 rounded-lg hover:bg-red-600 transition-colors">
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
                <input type="text" value={form.image} onChange={(e) => set("image", e.target.value)} className={inputCls} placeholder="https://images.unsplash.com/..." />
                {form.image && !form.images.some((i) => i.url === form.image) && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.image} alt="preview" className="mt-2 h-28 w-full object-cover rounded-xl border border-[#e8e4d8]"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                )}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="flex flex-col gap-5">
            {/* Tags */}
            <div className="bg-white border border-[#e8e4d8] rounded-2xl p-6">
              <p className={cn(sectionLabel, "flex items-center gap-1.5")}><Tag size={10} />Теги</p>
              <div className="flex gap-2 mb-3">
                <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                  className={cn(inputCls, "flex-1")} placeholder="Введите тег..." />
                <button type="button" onClick={addTag} className="px-3 py-2.5 bg-[#233516]/8 hover:bg-[#233516]/14 text-[#233516] rounded-xl transition-colors">
                  <Plus size={15} />
                </button>
              </div>
              {form.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {form.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 bg-[#233516]/8 text-[#233516] text-xs font-semibold px-2.5 py-1 rounded-full">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="text-[#233516]/50 hover:text-red-500 transition-colors ml-0.5"><X size={10} /></button>
                    </span>
                  ))}
                </div>
              ) : <p className="text-[#c4bfb2] text-xs">Нет тегов</p>}
            </div>

            {/* Cover preview */}
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
      <div className="sticky bottom-0 bg-[#fffcf3] border-t border-[#e8e4d8] px-6 lg:px-8 py-4">
        {error && <div className="bg-red-50 border border-red-100 text-red-700 rounded-xl px-4 py-2.5 text-sm mb-4">{error}</div>}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving || uploading}
            className="flex items-center gap-2 bg-[#233516] text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-[#2c4219] active:scale-[0.99] transition-all disabled:opacity-60">
            <Save size={14} />
            {saving ? "Сохранение..." : "Сохранить"}
          </button>
          <Link href="/admin/routes" className="px-5 py-2.5 text-sm font-medium text-[#888] hover:text-[#0e0f11] transition-colors">Отмена</Link>
        </div>
      </div>
    </form>
  );
}
