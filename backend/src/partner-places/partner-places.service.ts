import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export interface PartnerPlacePayload {
  name?: string;
  category?: string;
  description?: string;
  price?: string;
  rating?: number;
  tags?: unknown;
  image?: string;
  images?: unknown;
  lat?: number;
  lng?: number;
}

const ALLOWED = new Set([
  "name", "category", "description", "price",
  "rating", "tags", "image", "images", "lat", "lng",
]);

@Injectable()
export class PartnerPlacesService {
  constructor(private readonly prisma: PrismaService) {}

  async findOwnPlace(placeId: number, partnerId: number) {
    const place = await this.prisma.place.findUnique({ where: { id: placeId } });
    if (!place) throw new NotFoundException(`Place #${placeId} not found`);
    if (place.partnerId !== partnerId) throw new ForbiddenException("Access denied");
    return place;
  }

  async updateOwnPlace(placeId: number, payload: PartnerPlacePayload, partnerId: number) {
    await this.findOwnPlace(placeId, partnerId);
    const data: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(payload as Record<string, unknown>)) {
      if (ALLOWED.has(k)) data[k] = v;
    }
    return this.prisma.place.update({ where: { id: placeId }, data: data as never });
  }

  findAllOwn(partnerId: number) {
    return this.prisma.place.findMany({ where: { partnerId }, orderBy: { id: "asc" } });
  }

  async subscribe(partnerId: number, plan: "monthly" | "annual") {
    const months = plan === "annual" ? 12 : 1;
    const endsAt = new Date();
    endsAt.setMonth(endsAt.getMonth() + months);
    return this.prisma.partner.update({
      where: { id: partnerId },
      data: { subscriptionActive: true, subscriptionEndsAt: endsAt },
      select: { id: true, subscriptionActive: true, subscriptionEndsAt: true },
    });
  }
}
