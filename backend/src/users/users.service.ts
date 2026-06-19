import { BadRequestException, Injectable } from "@nestjs/common";
import { createHash } from "crypto";
import { PrismaService } from "../prisma/prisma.service";

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

function isEmail(login: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(login);
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async register(login: string, password: string, name?: string) {
    if (!password || password.length < 8) {
      throw new BadRequestException("Пароль должен быть не менее 8 символов");
    }

    const email = isEmail(login) ? login : null;
    const phone = email ? null : login;

    const existing = await this.prisma.user.findFirst({
      where: email ? { email } : { phone },
    });
    if (existing) {
      throw new BadRequestException(
        email ? "Email уже зарегистрирован" : "Телефон уже зарегистрирован"
      );
    }

    return this.prisma.user.create({
      data: { email, phone, name: name ?? null, passwordHash: hashPassword(password) },
      select: { id: true, name: true, email: true, phone: true, createdAt: true },
    });
  }

  async findByLogin(login: string) {
    if (isEmail(login)) {
      return this.prisma.user.findUnique({ where: { email: login } });
    }
    return this.prisma.user.findUnique({ where: { phone: login } });
  }

  validatePassword(hash: string, password: string): boolean {
    return hash === hashPassword(password);
  }

  findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, phone: true, createdAt: true },
    });
  }
}
