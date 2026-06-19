import { Injectable, NotFoundException } from "@nestjs/common";
import { PlaceType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export interface PlacePayload {
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
  type?: PlaceType;
  partnerId?: number | null;
}

const UPDATABLE_FIELDS = new Set([
  "name", "category", "description", "price", "rating",
  "tags", "image", "images", "lat", "lng", "type",
]);

function buildData(payload: PlacePayload & { id?: unknown }) {
  const { partnerId, id, ...rest } = payload as Record<string, unknown> & { partnerId?: number | null; id?: unknown };

  const data: Record<string, unknown> = {};
  for (const key of Object.keys(rest)) {
    if (UPDATABLE_FIELDS.has(key)) data[key] = rest[key];
  }

  if (partnerId !== undefined) {
    if (partnerId === null) {
      data.partner = { disconnect: true };
    } else {
      data.partner = { connect: { id: Number(partnerId) } };
    }
  }

  return data;
}

@Injectable()
export class PlacesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(type?: PlaceType) {
    return this.prisma.place.findMany({
      where: type ? { type } : undefined,
      include: { partner: { select: { id: true, companyName: true, subscriptionActive: true } } },
      orderBy: { id: "asc" },
    });
  }

  async findOne(id: number) {
    const place = await this.prisma.place.findUnique({
      where: { id },
      include: { partner: { select: { id: true, companyName: true, subscriptionActive: true } } },
    });
    if (!place) throw new NotFoundException(`Place #${id} not found`);
    return place;
  }

  create(payload: PlacePayload & { id: number }) {
    const data = buildData(payload);
    data.id = payload.id;
    return this.prisma.place.create({ data: data as never });
  }

  async update(id: number, payload: PlacePayload) {
    await this.findOne(id);
    const data = buildData(payload);
    return this.prisma.place.update({ where: { id }, data: data as never });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.place.delete({ where: { id } });
  }
}
