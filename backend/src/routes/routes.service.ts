import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export interface RoutePayload {
  title?: string;
  subtitle?: string;
  path?: string;
  description?: string;
  tags?: unknown;
  image?: string;
  images?: unknown;
}

@Injectable()
export class RoutesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.route.findMany({ orderBy: { id: "asc" } });
  }

  async findOne(id: number) {
    const route = await this.prisma.route.findUnique({ where: { id } });
    if (!route) throw new NotFoundException(`Route #${id} not found`);
    return route;
  }

  create(data: RoutePayload & { id: number }) {
    return this.prisma.route.create({ data: data as never });
  }

  async update(id: number, data: RoutePayload) {
    await this.findOne(id);
    return this.prisma.route.update({ where: { id }, data: data as never });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.route.delete({ where: { id } });
  }
}
