import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { fetchRoute } from "@/lib/server-api";
import PlaceCarousel, { MediaItem } from "@/components/place-carousel";
import ReviewSection from "@/components/review-section";

export const dynamic = "force-dynamic";

export default async function RouteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const route = await fetchRoute(Number(id));
  if (!route) notFound();

  const carouselItems: MediaItem[] =
    route.images?.length > 0
      ? route.images
      : route.image
      ? [{ type: "image", url: route.image }]
      : [];

  return (
    <div className="w-full bg-[#fffcf3]">
      {/* Hero */}
      <section className="py-10 md:py-16 px-4 md:px-16">
        <div className="max-w-[1280px] mx-auto">
          <Link
            href="/routes"
            className="inline-flex items-center gap-1.5 font-sans text-sm text-[#666] hover:text-[#233516] transition-colors mb-6"
          >
            <ChevronLeft className="size-4" />
            Назад к маршрутам
          </Link>

          <div className="bg-white rounded-2xl shadow-[5px_2px_35px_0px_rgba(84,61,50,0.15)] p-6 md:p-12 flex flex-col md:flex-row gap-8 md:gap-12">
            <div className="relative w-full md:w-[500px] h-[300px] md:h-[400px] flex-shrink-0">
              <PlaceCarousel
                items={carouselItems}
                alt={route.title}
                className="w-full h-full"
              />
            </div>

            <div className="flex-1 flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  {route.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-[#ddd] px-3 py-1.5 rounded-lg text-[#666] text-sm font-sans"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h1 className="font-display text-3xl md:text-5xl text-[#0e0f11]">
                  {route.title}
                </h1>
              </div>

              <div className="flex flex-col gap-2">
                <p className="font-sans font-semibold text-base md:text-lg text-[#233516]">
                  {route.path}
                </p>
                <p className="font-sans font-normal text-base text-[#0e0f11]">
                  {route.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      {carouselItems.length > 0 && (
        <section className="py-10 md:py-16 px-4 md:px-16">
          <div className="max-w-[1280px] mx-auto">
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl text-[#0e0f11] text-center mb-8 md:mb-12">
              Галерея
            </h2>
            <div className="relative h-[220px] md:h-[380px] lg:h-[500px]">
              <PlaceCarousel
                items={carouselItems}
                alt={route.title}
                className="w-full h-full"
              />
            </div>
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="py-10 md:py-16 px-4 md:px-16">
        <div className="max-w-[1280px] mx-auto">
          <ReviewSection routeId={route.id} />
        </div>
      </section>
    </div>
  );
}
