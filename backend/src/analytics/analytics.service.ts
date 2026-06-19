import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

type Period = "today" | "week" | "month";

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  trackEvent(placeId: number, eventType: "view" | "ai_show") {
    return this.prisma.analyticsEvent.create({ data: { placeId, eventType } });
  }

  async getPartnerAnalytics(
    partnerId: number,
    period: Period = "today",
    filterPlaceId?: number
  ) {
    const partnerRecord = await this.prisma.partner.findUnique({
      where: { id: partnerId },
      select: { subscriptionActive: true, subscriptionEndsAt: true },
    });

    const allPlaces = await this.prisma.place.findMany({
      where: { partnerId },
      select: { id: true, name: true, image: true, category: true, type: true },
    });

    const targetIds = filterPlaceId
      ? allPlaces.filter((p) => p.id === filterPlaceId).map((p) => p.id)
      : allPlaces.map((p) => p.id);

    const now = new Date();
    let startDate: Date;
    let bucketCount: number;
    let labels: string[];

    if (period === "today") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      bucketCount = 24;
      labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    } else if (period === "week") {
      startDate = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
      bucketCount = 7;
      labels = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
        return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
      });
    } else {
      startDate = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
      bucketCount = 30;
      labels = Array.from({ length: 30 }, (_, i) => {
        const d = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
        return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
      });
    }

    const events =
      targetIds.length > 0
        ? await this.prisma.analyticsEvent.findMany({
            where: { placeId: { in: targetIds }, createdAt: { gte: startDate } },
          })
        : [];

    const aiShows = new Array(bucketCount).fill(0);
    const views = new Array(bucketCount).fill(0);

    for (const event of events) {
      const date = new Date(event.createdAt);
      let bucket: number;

      if (period === "today") {
        bucket = date.getHours();
      } else if (period === "week") {
        bucket = Math.max(
          0,
          Math.min(
            Math.floor((date.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)),
            6
          )
        );
      } else {
        bucket = Math.max(
          0,
          Math.min(
            Math.floor((date.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)),
            29
          )
        );
      }

      if (event.eventType === "ai_show") aiShows[bucket]++;
      else if (event.eventType === "view") views[bucket]++;
    }

    const allPlaceIds = allPlaces.map((p) => p.id);
    const [totalBookings, totalRequests] = await Promise.all([
      allPlaceIds.length > 0
        ? this.prisma.booking.count({ where: { placeId: { in: targetIds } } })
        : Promise.resolve(0),
      allPlaceIds.length > 0
        ? this.prisma.placeRequest.count({ where: { placeId: { in: targetIds } } })
        : Promise.resolve(0),
    ]);

    // All events for per-place stats (always use all places for cards)
    const allEvents =
      allPlaceIds.length > 0
        ? await this.prisma.analyticsEvent.findMany({
            where: { placeId: { in: allPlaceIds }, createdAt: { gte: startDate } },
          })
        : [];

    const perPlace = allPlaces.map((p) => {
      const ev = allEvents.filter((e) => e.placeId === p.id);
      return {
        id: p.id,
        name: p.name,
        image: p.image,
        category: p.category,
        type: p.type,
        views: ev.filter((e) => e.eventType === "view").length,
        aiShows: ev.filter((e) => e.eventType === "ai_show").length,
      };
    });

    return {
      aiShows,
      views,
      labels,
      totalBookings,
      totalRequests,
      places: allPlaces.map((p) => ({ id: p.id, name: p.name })),
      perPlace,
      subscription: {
        active: partnerRecord?.subscriptionActive ?? false,
        endsAt: partnerRecord?.subscriptionEndsAt ?? null,
      },
    };
  }
}
