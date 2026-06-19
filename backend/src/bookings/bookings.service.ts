import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export interface BookingPayload {
  placeId: number;
  name: string;
  phone: string;
  email?: string;
  message?: string;
}

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: BookingPayload) {
    return this.prisma.booking.create({ data });
  }

  findByPlaceIds(placeIds: number[]) {
    if (placeIds.length === 0) return Promise.resolve([]);
    return this.prisma.booking.findMany({
      where: { placeId: { in: placeIds } },
      orderBy: { createdAt: "desc" },
    });
  }

  findAll() {
    return this.prisma.booking.findMany({ orderBy: { createdAt: "desc" } });
  }
}
