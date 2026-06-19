import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  findByUser(userId: number) {
    return this.prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  create(userId: number, data: { title: string; routeId?: number; placeIds?: number[] }) {
    return this.prisma.favorite.create({
      data: {
        userId,
        title: data.title,
        routeId: data.routeId ?? null,
        placeIds: data.placeIds ? JSON.stringify(data.placeIds) : null,
      },
    });
  }

  async remove(id: number, userId: number) {
    const fav = await this.prisma.favorite.findUnique({ where: { id } });
    if (!fav) throw new NotFoundException("Избранное не найдено");
    if (fav.userId !== userId) throw new ForbiddenException();
    return this.prisma.favorite.delete({ where: { id } });
  }
}
