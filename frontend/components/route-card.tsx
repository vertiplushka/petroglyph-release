import Link from "next/link";
import Image from "next/image";
import { IMG_ROUTE_CARDS } from "@/lib/images";

interface RouteCardProps {
  title?: string;
  description?: string;
  tags?: string[];
  cta?: string;
  href?: string;
  image?: string;
}

export function RouteCard({
  title = "Мой маршрут",
  description,
  tags,
  cta = "Посмотреть",
  href = "/routes",
  image = IMG_ROUTE_CARDS[0],
}: RouteCardProps) {
  return (
    <article className="flex flex-col gap-3 rounded-xl bg-white border border-[#0e0f11]/5 overflow-hidden">
      <div className="relative aspect-[4/3] bg-[#d9d9d9]">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col gap-3 p-4">
        <h3 className="font-display font-semibold text-lg text-[#0e0f11]">{title}</h3>
        {description && (
          <p className="font-sans text-sm text-[#0e0f11]/70 leading-relaxed line-clamp-3">
            {description}
          </p>
        )}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-[#233516]/25 px-2.5 py-0.5 font-sans text-[11px] text-[#233516]"
              >
                {t}
              </span>
            ))}
          </div>
        )}
        <Link
          href={href}
          className="self-start rounded-md bg-[#233516] text-[#fffcf3] px-4 py-2 font-sans text-xs font-medium hover:bg-[#1a2811] transition"
        >
          {cta}
        </Link>
      </div>
    </article>
  );
}
