import { Injectable, NotFoundException } from "@nestjs/common";
import { ReviewStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export interface CreateReviewDto {
  author: string;
  rating: number;
  text: string;
  placeId?: number;
  routeId?: number;
}

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(status?: ReviewStatus, placeId?: number, routeId?: number) {
    return this.prisma.review.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(placeId != null ? { placeId } : {}),
        ...(routeId != null ? { routeId } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
  }

  create(dto: CreateReviewDto) {
    const now = new Date();
    const date = now.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
    return this.prisma.review.create({
      data: {
        author: dto.author,
        rating: dto.rating,
        text: dto.text,
        date,
        status: ReviewStatus.pending,
        placeId: dto.placeId ?? null,
        routeId: dto.routeId ?? null,
      },
    });
  }

  async approve(id: number) {
    await this.findOne(id);
    return this.prisma.review.update({ where: { id }, data: { status: ReviewStatus.approved } });
  }

  async reject(id: number) {
    await this.findOne(id);
    return this.prisma.review.update({ where: { id }, data: { status: ReviewStatus.rejected } });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.review.delete({ where: { id } });
  }

  private async findOne(id: number) {
    const r = await this.prisma.review.findUnique({ where: { id } });
    if (!r) throw new NotFoundException(`Review #${id} not found`);
    return r;
  }
}
