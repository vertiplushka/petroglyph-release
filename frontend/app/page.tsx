import Link from "next/link";
import Image from "next/image";
import { Compass, BookOpen, Users, ChevronRight, Star } from "lucide-react";
import { fetchPlaces } from "@/lib/server-api";
import HeroChatMap from "@/components/hero-chat-map";
import { HeroHeader } from "@/components/hero-context";

export default async function HomePage() {
  const heroPlaces = (await fetchPlaces()).slice(0, 3);

  return (
    <div className="w-full">
      <HeroHeader />

      {/* ── Hero ── */}
      <section className="relative -mt-[92px] pt-[92px] py-12 md:py-20 px-4 md:px-16 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1655047682631-5c4d3330d9b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920"
          alt=""
          fill
          className="object-cover object-center"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/60" />

        <div className="relative max-w-[1280px] mx-auto flex flex-col gap-8 md:gap-12">
          <div className="flex flex-col gap-3 items-center text-center">
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-white max-w-[720px] drop-shadow-md">
              Спланируй свой отдых с ИИ помощником
            </h1>
            <p className="font-sans text-sm md:text-base text-white/75 max-w-[500px]">
              Опишите, что хотите — и гид подберёт маршрут, отметит места на карте
            </p>
          </div>
          <HeroChatMap />
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-[#fffcf3] py-16 md:py-28 px-4 md:px-16">
        <div className="max-w-[1280px] mx-auto flex flex-col gap-10 md:gap-16 items-center">
          <div className="text-center">
            <p className="font-sans text-sm text-[#0e0f11]/50 uppercase tracking-widest mb-3">Платформа</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-[#0e0f11]">
              Открой свой Алтай
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 w-full">

            <div className="bg-[#fffdf8] rounded-2xl shadow-[5px_2px_35px_0px_rgba(84,61,50,0.10)] p-6 md:p-8 flex flex-col gap-5">
              <div className="size-13 rounded-2xl bg-[#233516]/8 flex items-center justify-center w-fit p-3.5">
                <Compass className="size-6 text-[#233516]" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-sans font-bold text-xl text-[#0e0f11]">Для туристов</h3>
                <p className="font-sans text-sm text-[#666] leading-relaxed">
                  Получите готовый маршрут за минуты. ИИ-гид подберёт места под ваши интересы,
                  сезон и бюджет — и отметит всё на карте.
                </p>
              </div>
              <Link
                href="/places"
                className="mt-auto inline-flex items-center gap-1.5 text-sm font-sans font-semibold text-[#233516] hover:gap-3 transition-all"
              >
                Смотреть места <ChevronRight className="size-4" />
              </Link>
            </div>

            <div className="bg-[#fffdf8] rounded-2xl shadow-[5px_2px_35px_0px_rgba(84,61,50,0.10)] p-6 md:p-8 flex flex-col gap-5">
              <div className="size-13 rounded-2xl bg-[#233516]/8 flex items-center justify-center w-fit p-3.5">
                <BookOpen className="size-6 text-[#233516]" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-sans font-bold text-xl text-[#0e0f11]">Для студентов и исследователей</h3>
                <p className="font-sans text-sm text-[#666] leading-relaxed">
                  Планируйте поездки без экскурсий и лишних трат. Истории, факты
                  и события — и возможность делиться своими фото и отзывами.
                </p>
              </div>
              <Link
                href="/places"
                className="mt-auto inline-flex items-center gap-1.5 text-sm font-sans font-semibold text-[#233516] hover:gap-3 transition-all"
              >
                Смотреть места <ChevronRight className="size-4" />
              </Link>
            </div>

            <div className="bg-[#fffdf8] rounded-2xl shadow-[5px_2px_35px_0px_rgba(84,61,50,0.10)] p-6 md:p-8 flex flex-col gap-5">
              <div className="size-13 rounded-2xl bg-[#233516]/8 flex items-center justify-center w-fit p-3.5">
                <Users className="size-6 text-[#233516]" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-sans font-bold text-xl text-[#0e0f11]">Для бизнеса</h3>
                <p className="font-sans text-sm text-[#666] leading-relaxed">
                  Разместите отель, кафе или экскурсию в каталоге. ИИ-гид будет рекомендовать
                  вас тысячам туристов, которые уже планируют поездку.
                </p>
              </div>
              <Link
                href="/partners"
                className="mt-auto inline-flex items-center gap-1.5 text-sm font-sans font-semibold text-[#233516] hover:gap-3 transition-all"
              >
                Стать партнёром <ChevronRight className="size-4" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── Popular Places ── */}
      <section className="bg-[#fffcf3] py-16 md:py-28 px-4 md:px-16">
        <div className="max-w-[1280px] mx-auto flex flex-col gap-10 md:gap-14 items-center">

          <div className="max-w-[640px] w-full flex flex-col gap-3 items-center text-center">
            <p className="font-sans text-sm text-[#0e0f11]/50 tracking-widest uppercase">Популярное</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-[#0e0f11]">
              Места, которые стоит увидеть
            </h2>
            <p className="font-sans text-base md:text-lg text-[#666]">
              Рекомендации ИИ-гида на основе отзывов путешественников
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 w-full">
            {heroPlaces.map((place) => (
              <Link
                key={place.id}
                href={`/places/${place.id}`}
                className="relative h-[420px] sm:h-[500px] lg:h-[580px] rounded-2xl shadow-[5px_2px_35px_0px_rgba(84,61,50,0.15)] overflow-hidden group"
              >
                <Image
                  src={place.image}
                  alt={place.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  unoptimized
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                {/* Top badges */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                  <span className="bg-black/30 backdrop-blur-sm text-white/90 text-xs font-sans px-3 py-1.5 rounded-full">
                    {place.category}
                  </span>
                  <span className="bg-black/30 backdrop-blur-sm text-white/90 text-xs font-sans px-3 py-1.5 rounded-full flex items-center gap-1">
                    <Star className="size-3 fill-amber-400 text-amber-400" />
                    {place.rating}
                  </span>
                </div>

                {/* Bottom content */}
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 flex flex-col gap-2.5 text-white">
                  <h3 className="font-sans font-bold text-xl md:text-2xl leading-tight">
                    {place.name}
                  </h3>
                  <p className="font-sans text-sm text-white/70 line-clamp-2">
                    {place.description}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-sans font-semibold text-base text-white/90">
                      от {place.price}
                    </span>
                    <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm group-hover:bg-white/25 transition-colors px-4 py-1.5 rounded-full text-sm font-sans font-medium">
                      Подробнее <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <Link
            href="/places"
            className="border border-[#233516] text-[#233516] hover:bg-[#233516] hover:text-[#fffcf3] transition-colors px-8 py-3 rounded-xl font-sans font-semibold text-base"
          >
            Все места →
          </Link>

        </div>
      </section>

    </div>
  );
}
