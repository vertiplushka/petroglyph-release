import Image from "next/image";
import Link from "next/link";
import { HeroHeader } from "@/components/hero-context";
import {
  BedDouble,
  UtensilsCrossed,
  Landmark,
  Users,
  Zap,
  CalendarDays,
  Bot,
  MapPin,
  BarChart3,
  MessageSquare,
} from "lucide-react";

const partnerTypes = [
  {
    icon: BedDouble,
    title: "Отели и глэмпинги",
    description: "Разместитесь на карте, получайте запросы от путешественников и собирайте отзывы прямо на платформе.",
  },
  {
    icon: UtensilsCrossed,
    title: "Рестораны и кафе",
    description: "Покажите меню, атмосферу и спецпредложения гостям, которые уже едут в Алтай.",
  },
  {
    icon: Landmark,
    title: "Музеи и галереи",
    description: "Привлекайте культурных туристов: расскажите об экспозициях, ценах и способах добраться.",
  },
  {
    icon: Users,
    title: "Гиды и турагентства",
    description: "Публикуйте маршруты, принимайте заявки и становитесь частью рекомендаций ИИ-гида.",
  },
  {
    icon: Zap,
    title: "Активный отдых",
    description: "Рафтинг, конные прогулки, треккинг — ваши активности увидят те, кто ищет приключений.",
  },
  {
    icon: CalendarDays,
    title: "Фестивали и события",
    description: "Анонсируйте мероприятия заранее, формируйте аудиторию и продавайте билеты через платформу.",
  },
];

const features = [
  {
    icon: Bot,
    title: "ИИ-гид рекомендует вас",
    description: "Когда турист спрашивает, что посетить или где остановиться, гид называет ваше заведение среди первых.",
  },
  {
    icon: MapPin,
    title: "Страница в каталоге",
    description: "Фотографии, описание, координаты, режим работы и цены — всё в одном месте, всегда актуально.",
  },
  {
    icon: BarChart3,
    title: "Аналитика в реальном времени",
    description: "Смотрите, сколько туристов нашли вас через платформу, и понимайте, что интересует вашу аудиторию.",
  },
  {
    icon: MessageSquare,
    title: "Отзывы и доверие",
    description: "Собирайте честные отзывы путешественников и отвечайте на вопросы потенциальных гостей.",
  },
];

const stats = [
  { value: "25+", label: "мест в каталоге" },
  { value: "4", label: "маршрута на старте" },
  { value: "∞", label: "возможностей для роста" },
];

export default function PartnersPage() {
  return (
    <div className="w-full bg-[#fffcf3]">
      <HeroHeader />

      {/* ── Hero ── */}
      <section className="relative -mt-[92px] pt-[92px] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1501854140801-50d01698950b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920"
          alt=""
          fill
          className="object-cover object-center"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/65" />

        <div className="relative z-10 py-24 md:py-36 px-4 md:px-16">
          <div className="max-w-[1280px] mx-auto flex flex-col items-center text-center gap-6">
            <p className="font-sans text-sm text-white/70 uppercase tracking-widest">
              Для бизнеса
            </p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-white max-w-[760px] drop-shadow-md">
              Привлекайте туристов в ваш бизнес
            </h1>
            <p className="font-sans text-base md:text-lg text-white/80 max-w-[560px]">
              Разместите своё заведение на платформе Алтай-гида — и тысячи путешественников
              узнают о вас ещё до отъезда из дома.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <Link
                href="/login/partner"
                className="bg-[#233516] px-8 py-3.5 rounded-xl font-sans font-semibold text-base text-[#fffcf3] hover:bg-[#1a2811] transition-colors shadow-[0_4px_20px_rgba(35,53,22,0.4)]"
              >
                Стать партнёром
              </Link>
              <a
                href="#contact"
                className="bg-white/15 backdrop-blur-sm border border-white/30 px-8 py-3.5 rounded-xl font-sans font-semibold text-base text-white hover:bg-white/25 transition-colors"
              >
                Узнать подробнее
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Статистика ── */}
      <section className="bg-[#233516] py-12 px-4 md:px-16">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-3 gap-4 md:gap-8">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col items-center text-center gap-1">
                <span className="font-display text-3xl md:text-5xl text-[#fffcf3]">{s.value}</span>
                <span className="font-sans text-xs md:text-sm text-white/60">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Для кого ── */}
      <section className="py-16 md:py-28 px-4 md:px-16 bg-[#fffcf3]">
        <div className="max-w-[1280px] mx-auto">
          <div className="max-w-[640px] mx-auto text-center mb-12 md:mb-16">
            <h2 className="font-display text-3xl md:text-4xl text-[#0e0f11] mb-4">
              Кому подходит
            </h2>
            <p className="font-sans text-base md:text-lg text-[#666]">
              Платформа открыта для любого бизнеса, связанного с туризмом на Алтае
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {partnerTypes.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-6 shadow-[5px_2px_35px_0px_rgba(84,61,50,0.10)] flex flex-col gap-4"
                >
                  <div className="size-12 rounded-xl bg-[#233516]/8 flex items-center justify-center flex-shrink-0">
                    <Icon className="size-6 text-[#233516]" />
                  </div>
                  <div>
                    <h3 className="font-sans font-bold text-lg text-[#0e0f11] mb-2">{item.title}</h3>
                    <p className="font-sans text-sm text-[#666] leading-relaxed">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Пейзаж-разделитель ── */}
      <section className="px-4 md:px-16 py-4">
        <div className="max-w-[1280px] mx-auto">
          <div className="relative h-[280px] md:h-[420px] rounded-3xl overflow-hidden shadow-[5px_2px_35px_0px_rgba(84,61,50,0.15)]">
            <Image
              src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920"
              alt="Горный Алтай"
              fill
              className="object-cover object-center"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
            <div className="absolute inset-0 flex items-center px-8 md:px-16">
              <div className="max-w-[480px]">
                <p className="font-sans text-sm text-white/70 uppercase tracking-widest mb-3">Горный Алтай</p>
                <h3 className="font-display text-2xl md:text-4xl text-white leading-snug">
                  Миллионы туристов выбирают Алтай каждый год
                </h3>
                <p className="font-sans text-sm md:text-base text-white/75 mt-3">
                  Станьте частью экосистемы, которая помогает путешественникам открывать регион.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Что предлагаем ── */}
      <section className="py-16 md:py-28 px-4 md:px-16 bg-[#fffcf3]">
        <div className="max-w-[1280px] mx-auto">
          <div className="max-w-[640px] mx-auto text-center mb-12 md:mb-16">
            <h2 className="font-display text-3xl md:text-4xl text-[#0e0f11] mb-4">
              Что вы получаете
            </h2>
            <p className="font-sans text-base md:text-lg text-[#666]">
              Инструменты для роста, которые работают пока туристы планируют поездку
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-[5px_2px_35px_0px_rgba(84,61,50,0.15)] p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
              {features.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex gap-5">
                    <div className="size-11 rounded-xl bg-[#233516]/8 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="size-5 text-[#233516]" />
                    </div>
                    <div>
                      <h3 className="font-sans font-bold text-base text-[#0e0f11] mb-1.5">{item.title}</h3>
                      <p className="font-sans text-sm text-[#666] leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Форма ── */}
      <section id="contact" className="py-16 md:py-28 px-4 md:px-16 bg-white">
        <div className="max-w-[720px] mx-auto">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="font-display text-3xl md:text-4xl text-[#0e0f11] mb-3">
              Оставьте заявку
            </h2>
            <p className="font-sans text-base text-[#666]">
              Расскажите о своём бизнесе — мы свяжемся в течение одного рабочего дня
            </p>
          </div>

          <form className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="font-sans font-medium text-sm text-[#0e0f11]">Тип бизнеса</label>
                <select className="border border-[#e5e5e5] rounded-xl px-4 py-3 font-sans text-sm text-[#0e0f11] bg-white outline-none focus:border-[#233516] transition-colors appearance-none cursor-pointer">
                  <option value="">Выберите категорию</option>
                  <option>Отель / глэмпинг</option>
                  <option>Ресторан / кафе</option>
                  <option>Музей / галерея</option>
                  <option>Гид / турагентство</option>
                  <option>Активный отдых</option>
                  <option>Фестиваль / событие</option>
                  <option>Другое</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-sans font-medium text-sm text-[#0e0f11]">Название объекта</label>
                <input
                  type="text"
                  placeholder="Например: Глэмпинг «Катунь»"
                  className="border border-[#e5e5e5] rounded-xl px-4 py-3 font-sans text-sm outline-none focus:border-[#233516] transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="font-sans font-medium text-sm text-[#0e0f11]">Ваше имя</label>
                <input
                  type="text"
                  placeholder="Иван Петров"
                  className="border border-[#e5e5e5] rounded-xl px-4 py-3 font-sans text-sm outline-none focus:border-[#233516] transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-sans font-medium text-sm text-[#0e0f11]">Телефон или email</label>
                <input
                  type="text"
                  placeholder="+7 923 000 00 00"
                  className="border border-[#e5e5e5] rounded-xl px-4 py-3 font-sans text-sm outline-none focus:border-[#233516] transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-sans font-medium text-sm text-[#0e0f11]">Адрес или район</label>
              <input
                type="text"
                placeholder="Горно-Алтайск, Чемал, Артыбаш…"
                className="border border-[#e5e5e5] rounded-xl px-4 py-3 font-sans text-sm outline-none focus:border-[#233516] transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-sans font-medium text-sm text-[#0e0f11]">Комментарий</label>
              <textarea
                rows={3}
                placeholder="Коротко о бизнесе, количестве гостей, пожелания по сотрудничеству"
                className="border border-[#e5e5e5] rounded-xl px-4 py-3 font-sans text-sm outline-none focus:border-[#233516] transition-colors resize-none"
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-0.5 size-4 rounded border-[#ccc] accent-[#233516]" />
              <span className="font-sans text-sm text-[#666]">
                Согласен с{" "}
                <a href="/privacy" className="text-[#233516] underline underline-offset-2">
                  политикой конфиденциальности
                </a>{" "}
                и обработкой персональных данных
              </span>
            </label>

            <button
              type="submit"
              className="self-start bg-[#233516] px-8 py-3.5 rounded-xl font-sans font-semibold text-base text-[#fffcf3] hover:bg-[#1a2811] transition-colors shadow-[0_4px_20px_rgba(35,53,22,0.25)]"
            >
              Отправить заявку
            </button>
          </form>
        </div>
      </section>

    </div>
  );
}
