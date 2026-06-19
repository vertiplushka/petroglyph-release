import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Star, BadgeCheck } from "lucide-react";
import { fetchPlace } from "@/lib/server-api";
import PlaceChat from "@/components/place-chat";
import PlaceCarousel, { MediaItem } from "@/components/place-carousel";
import PlaceMap from "@/components/place-map";
import ReviewSection from "@/components/review-section";
import { PlaceViewTracker } from "@/components/place-view-tracker";

export const dynamic = "force-dynamic";

export default async function PlaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const place = await fetchPlace(Number(id));
  if (!place) notFound();

  const carouselItems: MediaItem[] =
    place.images.length > 0
      ? place.images
      : place.image
      ? [{ type: "image", url: place.image }]
      : [];

  return (
    <div className="w-full bg-[#fffcf3]">
      <PlaceViewTracker placeId={place.id} />
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="py-10 md:py-16 px-4 md:px-16">
        <div className="max-w-[1280px] mx-auto">
          <Link
            href="/places"
            className="inline-flex items-center gap-1.5 font-sans text-sm text-[#666] hover:text-[#233516] transition-colors mb-6"
          >
            <ChevronLeft className="size-4" />
            Назад к каталогу
          </Link>

          <div className="bg-white rounded-2xl shadow-[5px_2px_35px_0px_rgba(84,61,50,0.15)] p-6 md:p-12 flex flex-col md:flex-row gap-8 md:gap-12">
            {/* Carousel */}
            <div className="relative w-full md:w-[500px] h-[300px] md:h-[400px] flex-shrink-0">
              <PlaceCarousel
                items={carouselItems}
                alt={place.name}
                className="w-full h-full"
              />
            </div>

            <div className="flex-1 flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  {place.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-[#ddd] px-3 py-1.5 rounded-lg text-[#666] text-sm font-sans"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h1 className="font-display text-3xl md:text-5xl text-[#0e0f11]">
                  «{place.name}»
                </h1>
                {place.partner?.subscriptionActive && (
                  <div className="inline-flex items-center gap-1.5 bg-[#233516]/8 border border-[#233516]/20 rounded-lg px-3 py-1.5 w-fit">
                    <BadgeCheck className="size-4 text-[#233516]" strokeWidth={2.5} />
                    <span className="text-[#233516] text-xs font-bold">Партнёр Petroglyph</span>
                    {place.partner.companyName && (
                      <span className="text-[#233516]/50 text-xs">· {place.partner.companyName}</span>
                    )}
                  </div>
                )}
              </div>

              <p className="font-sans font-normal text-base md:text-lg text-[#0e0f11]">
                {place.description}
              </p>

              <div className="flex items-center gap-3 mt-auto">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`size-5 ${i < Math.round(place.rating) ? "text-amber-400 fill-amber-400" : "text-[#ddd] fill-[#ddd]"}`}
                    />
                  ))}
                </div>
                <span className="font-sans font-semibold text-[#0e0f11]">{place.rating}</span>
                <span className="font-sans text-[#666] text-sm">• от {place.price}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Map ───────────────────────────────────────────────────── */}
      <section className="py-10 md:py-16 px-4 md:px-16">
        <div className="max-w-[1280px] mx-auto">
          <div className="h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-[5px_2px_35px_0px_rgba(84,61,50,0.15)]">
            <PlaceMap lat={place.lat} lng={place.lng} name={place.name} />
          </div>
        </div>
      </section>

      {/* ── Gallery carousel ──────────────────────────────────────── */}
      {carouselItems.length > 0 && (
        <section className="py-10 md:py-16 px-4 md:px-16">
          <div className="max-w-[1280px] mx-auto">
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl text-[#0e0f11] text-center mb-8 md:mb-12">
              Галерея
            </h2>
            <div className="relative h-[220px] md:h-[380px] lg:h-[500px]">
              <PlaceCarousel
                items={carouselItems}
                alt={place.name}
                className="w-full h-full"
              />
            </div>
          </div>
        </section>
      )}

      {/* ── Reviews ───────────────────────────────────────────────── */}
      <section className="py-10 md:py-16 px-4 md:px-16">
        <div className="max-w-[1280px] mx-auto">
          <ReviewSection placeId={place.id} />
        </div>
      </section>

      <PlaceChat placeId={place.id} />
    </div>
  );
}
