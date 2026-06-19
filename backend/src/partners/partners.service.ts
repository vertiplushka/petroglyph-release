import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { createHash } from "crypto";
import { PrismaService } from "../prisma/prisma.service";

export interface PartnerPayload {
  companyName: string;
  legalAddress: string;
  inn: string;
  kpp: string;
  ogrn: string;
  contactPerson: string;
  phone: string;
  email: string;
  password?: string;
}

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

@Injectable()
export class PartnersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.partner.findMany({
      include: { places: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: number) {
    const partner = await this.prisma.partner.findUnique({
      where: { id },
      include: { places: { select: { id: true, name: true } } },
    });
    if (!partner) throw new NotFoundException(`Partner #${id} not found`);
    return partner;
  }

  create(data: PartnerPayload) {
    const { password, ...rest } = data;
    if (!password) throw new BadRequestException("Password is required");
    return this.prisma.partner.create({
      data: { ...rest, passwordHash: hashPassword(password) },
    });
  }

  async update(id: number, data: Partial<PartnerPayload>) {
    await this.findOne(id);
    const { password, ...rest } = data;
    const updateData: Record<string, unknown> = { ...rest };
    if (password) updateData.passwordHash = hashPassword(password);
    return this.prisma.partner.update({ where: { id }, data: updateData as never });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.partner.delete({ where: { id } });
  }

  findByEmail(email: string) {
    return this.prisma.partner.findUnique({ where: { email } });
  }

  validatePassword(hash: string, password: string): boolean {
    return hash === hashPassword(password);
  }
}
