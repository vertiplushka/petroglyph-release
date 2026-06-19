export const metadata = { title: "Design System — Алтай-гид" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-6">
      <h2 className="font-sans font-bold text-xs uppercase tracking-[0.15em] text-[#0e0f11]/40 pb-3 border-b border-[#e5e5e5]">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="font-sans text-xs text-[#0e0f11]/40 mt-1.5">{children}</p>;
}

// ─── Color swatch ───────────────────────────────────────────────────────────
function Swatch({
  bg, border = false, label, hex, note,
}: { bg: string; border?: boolean; label: string; hex: string; note?: string }) {
  return (
    <div className="flex flex-col gap-2 min-w-0">
      <div
        className={`h-20 rounded-xl ${border ? "border border-[#e5e5e5]" : ""}`}
        style={{ background: bg }}
      />
      <div>
        <p className="font-sans font-semibold text-sm text-[#0e0f11]">{label}</p>
        <p className="font-mono text-xs text-[#666]">{hex}</p>
        {note && <p className="font-sans text-xs text-[#0e0f11]/40 mt-0.5">{note}</p>}
      </div>
    </div>
  );
}

// ─── Type sample ─────────────────────────────────────────────────────────────
function TypeRow({ label, className, sample }: { label: string; className: string; sample: string }) {
  return (
    <div className="flex items-baseline gap-6 py-3 border-b border-[#e5e5e5]/60 last:border-0">
      <p className="font-sans text-xs text-[#0e0f11]/40 w-40 flex-shrink-0">{label}</p>
      <p className={`${className} text-[#0e0f11] flex-1 min-w-0`}>{sample}</p>
    </div>
  );
}

// ─── Radius swatch ───────────────────────────────────────────────────────────
function RadiusSwatch({ label, value, radius }: { label: string; value: string; radius: string }) {
  return (
    <div className="flex flex-col gap-2 items-center">
      <div
        className="w-20 h-20 bg-[#233516]/10 border border-[#233516]/20 flex items-center justify-center"
        style={{ borderRadius: radius }}
      >
        <span className="font-mono text-[10px] text-[#233516]">{value}</span>
      </div>
      <Label>{label}</Label>
    </div>
  );
}

// ─── Shadow sample ───────────────────────────────────────────────────────────
function ShadowSwatch({ label, shadow }: { label: string; shadow: string }) {
  return (
    <div className="flex flex-col gap-3">
      <div
        className="h-16 bg-white rounded-xl"
        style={{ boxShadow: shadow }}
      />
      <Label>{label}</Label>
    </div>
  );
}

export default function DesignPage() {
  return (
    <div className="w-full bg-[#fffcf3] min-h-screen">
      <div className="max-w-[960px] mx-auto px-4 md:px-8 py-14 md:py-20 flex flex-col gap-16 md:gap-20">

        {/* Header */}
        <div className="flex flex-col gap-3">
          <p className="font-sans text-xs uppercase tracking-[0.15em] text-[#0e0f11]/40">
            Алтай-гид · Design System
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-[#0e0f11]">
            Гайдлайн по дизайну
          </h1>
          <p className="font-sans text-base text-[#666] max-w-[520px]">
            Цвета, шрифты, отступы и компоненты — всё необходимое для создания материалов
            в стилистике платформы.
          </p>
        </div>

        {/* ── 1. Цвета ── */}
        <Section title="01 · Цветовая палитра">
          <div>
            <p className="font-sans font-semibold text-sm text-[#0e0f11] mb-4">Основные</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Swatch bg="#233516" label="Brand" hex="#233516" note="Основной зелёный" />
              <Swatch bg="#1a2811" label="Brand Dark" hex="#1a2811" note="Hover-состояние" />
              <Swatch bg="#fffcf3" label="Surface" hex="#fffcf3" border note="Фон страницы" />
              <Swatch bg="#fffdf8" label="Card" hex="#fffdf8" border note="Фон карточек" />
            </div>
          </div>

          <div>
            <p className="font-sans font-semibold text-sm text-[#0e0f11] mb-4">Текст</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Swatch bg="#0e0f11" label="Ink" hex="#0e0f11" note="Основной текст" />
              <Swatch bg="#666666" label="Secondary" hex="#666" note="Вторичный текст" />
              <Swatch bg="rgba(14,15,17,0.4)" label="Muted" hex="#0e0f11 / 40%" note="Подписи, метки" />
              <Swatch bg="#ffffff" label="White" hex="#ffffff" border note="Поверх фото" />
            </div>
          </div>

          <div>
            <p className="font-sans font-semibold text-sm text-[#0e0f11] mb-4">Утилиты</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Swatch bg="#e5e5e5" label="Border" hex="#e5e5e5" border note="Разделители" />
              <Swatch bg="#dddddd" label="Tag" hex="#ddd" note="Фон тегов" />
              <Swatch bg="rgba(35,53,22,0.08)" label="Brand Tint" hex="#233516 / 8%" border note="Иконки, тинты" />
              <Swatch bg="#fbbf24" label="Amber" hex="#fbbf24" note="Звёзды рейтинга" />
            </div>
          </div>
        </Section>

        {/* ── 2. Типографика ── */}
        <Section title="02 · Типографика">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[5px_2px_35px_0px_rgba(84,61,50,0.08)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <p className="font-sans text-xs text-[#0e0f11]/40 uppercase tracking-widest mb-2">Display / Заголовки</p>
                <p className="font-display text-3xl text-[#0e0f11]">Cormorant Garamond</p>
                <p className="font-display text-lg text-[#666] mt-1">400 · 500 · 600 · 700</p>
                <p className="font-sans text-xs text-[#0e0f11]/40 mt-3">
                  CSS: <span className="font-mono">font-family: var(--font-display)</span><br />
                  Tailwind: <span className="font-mono">font-display</span>
                </p>
              </div>
              <div>
                <p className="font-sans text-xs text-[#0e0f11]/40 uppercase tracking-widest mb-2">Sans / Интерфейс</p>
                <p className="font-sans text-3xl text-[#0e0f11]">Inter</p>
                <p className="font-sans text-lg text-[#666] mt-1">400 · 500 · 600 · 700</p>
                <p className="font-sans text-xs text-[#0e0f11]/40 mt-3">
                  CSS: <span className="font-mono">font-family: var(--font-sans)</span><br />
                  Tailwind: <span className="font-mono">font-sans</span>
                </p>
              </div>
            </div>

            <TypeRow label="Display / H1 · 5xl" className="font-display text-5xl" sample="Открой Алтай" />
            <TypeRow label="Display / H2 · 4xl" className="font-display text-4xl" sample="Каталог мест" />
            <TypeRow label="Display / H3 · 3xl" className="font-display text-3xl" sample="Маршруты по Алтаю" />
            <TypeRow label="Sans Bold · 2xl" className="font-sans font-bold text-2xl" sample="Белуха · 4509 м" />
            <TypeRow label="Sans Bold · xl" className="font-sans font-bold text-xl" sample="Телецкое озеро" />
            <TypeRow label="Sans Bold · lg" className="font-sans font-bold text-lg" sample="Для туристов" />
            <TypeRow label="Sans Regular · base" className="font-sans text-base" sample="Одно из глубочайших озёр России, называемое «Золотым»." />
            <TypeRow label="Sans Regular · sm" className="font-sans text-sm text-[#666]" sample="Добраться можно только по воде — на катере от посёлка Артыбаш." />
            <TypeRow label="Sans Regular · xs" className="font-sans text-xs text-[#0e0f11]/40 uppercase tracking-widest" sample="ПОПУЛЯРНОЕ · МЕСТА · МАРШРУТЫ" />
          </div>
        </Section>

        {/* ── 3. Скругления ── */}
        <Section title="03 · Скругления (border-radius)">
          <div className="flex flex-wrap gap-8">
            <RadiusSwatch label="rounded-lg · 8px" value="8px" radius="8px" />
            <RadiusSwatch label="rounded-xl · 12px" value="12px" radius="12px" />
            <RadiusSwatch label="rounded-2xl · 16px" value="16px" radius="16px" />
            <RadiusSwatch label="rounded-3xl · 24px" value="24px" radius="24px" />
            <RadiusSwatch label="rounded-full · 9999px" value="∞" radius="9999px" />
          </div>
          <div className="bg-white rounded-2xl p-5 text-sm font-sans text-[#555] shadow-[5px_2px_35px_0px_rgba(84,61,50,0.08)]">
            <p className="font-semibold text-[#0e0f11] mb-3">Правило применения</p>
            <ul className="flex flex-col gap-1.5 text-[#666]">
              <li><span className="font-mono text-[#233516]">rounded-lg</span> — кнопки, инпуты, маленькие бейджи</li>
              <li><span className="font-mono text-[#233516]">rounded-xl</span> — иконки, теги, пилюли</li>
              <li><span className="font-mono text-[#233516]">rounded-2xl</span> — карточки, формы, блоки</li>
              <li><span className="font-mono text-[#233516]">rounded-3xl</span> — большие баннеры, фото-блоки</li>
              <li><span className="font-mono text-[#233516]">rounded-full</span> — аватары, нотификации, чипы</li>
            </ul>
          </div>
        </Section>

        {/* ── 4. Тени ── */}
        <Section title="04 · Тени (box-shadow)">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <ShadowSwatch
              label="Карточки / основная"
              shadow="5px 2px 35px 0px rgba(84,61,50,0.15)"
            />
            <ShadowSwatch
              label="Карточки hover"
              shadow="5px 2px 45px 0px rgba(84,61,50,0.25)"
            />
            <ShadowSwatch
              label="Кнопки"
              shadow="4px 5px 20px 0px rgba(35,53,22,0.25)"
            />
          </div>
          <div className="bg-white rounded-2xl p-5 text-sm font-sans shadow-[5px_2px_35px_0px_rgba(84,61,50,0.08)]">
            <p className="font-sans font-semibold text-sm text-[#0e0f11] mb-3">CSS-значения</p>
            <div className="flex flex-col gap-2 font-mono text-xs text-[#666]">
              <p>карточка: <span className="text-[#233516]">5px 2px 35px 0px rgba(84,61,50,0.15)</span></p>
              <p>карточка hover: <span className="text-[#233516]">5px 2px 45px 0px rgba(84,61,50,0.25)</span></p>
              <p>кнопка: <span className="text-[#233516]">4px 5px 20px 0px rgba(35,53,22,0.25)</span></p>
            </div>
          </div>
        </Section>

        {/* ── 5. Отступы ── */}
        <Section title="05 · Отступы и сетка">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[5px_2px_35px_0px_rgba(84,61,50,0.08)] flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="font-sans font-semibold text-sm text-[#0e0f11] mb-3">Горизонтальные поля страницы</p>
                <div className="flex flex-col gap-1.5 font-sans text-sm text-[#666]">
                  <p>Мобильный: <span className="font-mono text-[#233516]">px-4 (16px)</span></p>
                  <p>Десктоп: <span className="font-mono text-[#233516]">md:px-16 (64px)</span></p>
                  <p>Максимальная ширина: <span className="font-mono text-[#233516]">max-w-[1280px]</span></p>
                </div>
              </div>
              <div>
                <p className="font-sans font-semibold text-sm text-[#0e0f11] mb-3">Вертикальные отступы секций</p>
                <div className="flex flex-col gap-1.5 font-sans text-sm text-[#666]">
                  <p>Малый: <span className="font-mono text-[#233516]">py-10 / py-12 (40–48px)</span></p>
                  <p>Средний: <span className="font-mono text-[#233516]">py-16 (64px)</span></p>
                  <p>Большой: <span className="font-mono text-[#233516]">md:py-28 (112px)</span></p>
                </div>
              </div>
              <div>
                <p className="font-sans font-semibold text-sm text-[#0e0f11] mb-3">Gap внутри карточек</p>
                <div className="flex flex-col gap-1.5 font-sans text-sm text-[#666]">
                  <p>Элементы: <span className="font-mono text-[#233516]">gap-2 / gap-3 (8–12px)</span></p>
                  <p>Блоки: <span className="font-mono text-[#233516]">gap-4 / gap-5 (16–20px)</span></p>
                  <p>Секции: <span className="font-mono text-[#233516]">gap-6 / gap-8 (24–32px)</span></p>
                </div>
              </div>
              <div>
                <p className="font-sans font-semibold text-sm text-[#0e0f11] mb-3">Внутренние отступы карточек</p>
                <div className="flex flex-col gap-1.5 font-sans text-sm text-[#666]">
                  <p>Маленькие: <span className="font-mono text-[#233516]">p-4 / p-5 (16–20px)</span></p>
                  <p>Средние: <span className="font-mono text-[#233516]">p-6 / p-8 (24–32px)</span></p>
                  <p>Большие: <span className="font-mono text-[#233516]">md:p-12 (48px)</span></p>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* ── 6. Компоненты ── */}
        <Section title="06 · Компоненты">

          {/* Кнопки */}
          <div>
            <p className="font-sans font-semibold text-sm text-[#0e0f11] mb-4">Кнопки</p>
            <div className="flex flex-wrap gap-3 items-center">
              <button className="bg-[#233516] text-[#fffcf3] px-6 py-3 rounded-xl font-sans font-semibold text-sm shadow-[4px_5px_20px_0px_rgba(35,53,22,0.25)]">
                Основная
              </button>
              <button className="border border-[#233516] text-[#233516] px-6 py-3 rounded-xl font-sans font-semibold text-sm">
                Вторичная
              </button>
              <button className="bg-white/15 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-xl font-sans font-semibold text-sm bg-[#233516]/10 border-[#233516]/20 text-[#233516]">
                Ghost
              </button>
              <button className="bg-[#233516] text-[#fffcf3] px-4 py-2 rounded-lg font-sans font-semibold text-xs shadow-[4px_5px_20px_0px_rgba(35,53,22,0.25)]">
                Малая
              </button>
              <span className="bg-[#233516]/8 text-[#233516] px-3 py-1.5 rounded-full font-sans text-xs font-semibold">
                Чип
              </span>
            </div>
            <div className="mt-3 font-sans text-xs text-[#666] flex flex-wrap gap-4">
              <span>Основная: <span className="font-mono">bg-[#233516] text-[#fffcf3] rounded-xl</span></span>
              <span>Вторичная: <span className="font-mono">border border-[#233516] text-[#233516]</span></span>
            </div>
          </div>

          {/* Теги / бейджи */}
          <div>
            <p className="font-sans font-semibold text-sm text-[#0e0f11] mb-4">Теги и бейджи</p>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="bg-[#ddd] text-[#666] px-2.5 py-1 rounded-lg font-sans text-xs">Природа</span>
              <span className="bg-[#ddd] text-[#666] px-2.5 py-1 rounded-lg font-sans text-xs">Озёра</span>
              <span className="bg-[#ddd] text-[#666] px-2.5 py-1 rounded-lg font-sans text-xs">История</span>
              <span className="bg-[#233516] text-white px-2.5 py-1 rounded-lg font-sans text-xs">Активный</span>
              <span className="border border-[#233516]/25 text-[#233516] px-2.5 py-1 rounded-full font-sans text-[11px]">Горы</span>
              <span className="bg-black/30 text-white px-3 py-1.5 rounded-full font-sans text-xs backdrop-blur-sm">На фото</span>
            </div>
          </div>

          {/* Карточка */}
          <div>
            <p className="font-sans font-semibold text-sm text-[#0e0f11] mb-4">Карточка места</p>
            <div className="max-w-[320px] bg-white rounded-2xl shadow-[5px_2px_35px_0px_rgba(84,61,50,0.15)] overflow-hidden">
              <div className="h-44 bg-gradient-to-br from-[#233516]/20 to-[#233516]/5 relative flex items-end p-4">
                <span className="bg-[#233516]/80 text-white text-xs font-sans px-2 py-1 rounded-lg">Природа</span>
                <span className="ml-auto bg-black/30 text-white text-xs font-sans px-2 py-1 rounded-full flex items-center gap-1">
                  ★ 4.9
                </span>
              </div>
              <div className="p-5 flex flex-col gap-2">
                <div className="flex gap-1.5 flex-wrap">
                  <span className="bg-[#ddd] text-[#666] px-2 py-0.5 rounded-lg text-xs font-sans">Горы</span>
                  <span className="bg-[#ddd] text-[#666] px-2 py-0.5 rounded-lg text-xs font-sans">Природа</span>
                </div>
                <h3 className="font-sans font-bold text-lg text-[#0e0f11]">Гора Белуха</h3>
                <p className="font-sans text-sm text-[#666] line-clamp-2">Высочайшая вершина Горного Алтая (4509 м). Священная гора, объект ЮНЕСКО.</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-sans text-sm font-semibold text-[#233516]">от 25 000 ₽</span>
                </div>
              </div>
            </div>
          </div>

          {/* Инпут */}
          <div>
            <p className="font-sans font-semibold text-sm text-[#0e0f11] mb-4">Поля ввода</p>
            <div className="flex flex-col gap-3 max-w-[400px]">
              <div className="flex flex-col gap-1.5">
                <label className="font-sans font-medium text-sm text-[#0e0f11]">Название</label>
                <input
                  type="text"
                  placeholder="Например: Гора Белуха"
                  readOnly
                  className="border border-[#e5e5e5] rounded-xl px-4 py-3 font-sans text-sm outline-none bg-white"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-sans font-medium text-sm text-[#0e0f11]">Активный</label>
                <input
                  type="text"
                  defaultValue="Телецкое озеро"
                  readOnly
                  className="border-2 border-[#233516] rounded-xl px-4 py-3 font-sans text-sm outline-none bg-white"
                />
              </div>
            </div>
            <p className="font-sans text-xs text-[#666] mt-2">
              Стандарт: <span className="font-mono">border-[#e5e5e5] rounded-xl</span> · Фокус: <span className="font-mono">border-[#233516]</span>
            </p>
          </div>

        </Section>

        {/* ── 7. Для презентации ── */}
        <Section title="07 · Советы для презентации">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: "Фоны слайдов",
                text: "Используйте #fffcf3 как основной фон. Для акцентных слайдов — #233516 (тёмно-зелёный) с белым текстом.",
              },
              {
                title: "Заголовки",
                text: "Cormorant Garamond, вес 600–700. Размер от 36 до 64pt. Цвет #0e0f11 на светлом, #fffcf3 на тёмном.",
              },
              {
                title: "Основной текст",
                text: "Inter, вес 400. Размер 14–18pt. Для вторичного текста используйте #666 или #0e0f11 с 50% прозрачностью.",
              },
              {
                title: "Акцентный элемент",
                text: "Зелёный прямоугольник #233516 как разделитель, подложка под цитату или заливка ключевого слайда.",
              },
              {
                title: "Иллюстрации",
                text: "Фотографии с Unsplash: Алтай, горы, озёра. Поверх фото — полупрозрачный градиент rgba(0,0,0,0.4–0.6).",
              },
              {
                title: "Скругления в Figma/PowerPoint",
                text: "8px для кнопок/текстовых блоков, 16px для карточек, 24px для больших блоков с фото.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl p-5 shadow-[5px_2px_35px_0px_rgba(84,61,50,0.08)] flex flex-col gap-2"
              >
                <p className="font-sans font-bold text-sm text-[#0e0f11]">{item.title}</p>
                <p className="font-sans text-sm text-[#666] leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Footer note */}
        <div className="pt-6 border-t border-[#e5e5e5] font-sans text-xs text-[#0e0f11]/30 flex justify-between">
          <span>Алтай-гид Design System · 2025</span>
          <span>globals.css · tailwind · next/font</span>
        </div>

      </div>
    </div>
  );
}
