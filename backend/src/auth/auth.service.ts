import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PartnersService } from "../partners/partners.service";
import { UsersService } from "../users/users.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly partnersService: PartnersService,
    private readonly usersService: UsersService
  ) {}

  login(username: string, password: string) {
    const adminUsername = process.env.ADMIN_USERNAME ?? "admin";
    const adminPassword = process.env.ADMIN_PASSWORD ?? "admin";

    if (username !== adminUsername || password !== adminPassword) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return {
      access_token: this.jwtService.sign({ sub: "admin", username, role: "admin" }),
    };
  }

  async partnerLogin(email: string, password: string) {
    const partner = await this.partnersService.findByEmail(email);
    if (!partner || !this.partnersService.validatePassword(partner.passwordHash, password)) {
      throw new UnauthorizedException("Неверный email или пароль");
    }

    return {
      access_token: this.jwtService.sign({
        sub: String(partner.id),
        role: "partner",
        partnerId: partner.id,
        email: partner.email,
        companyName: partner.companyName,
      }),
      partner: {
        id: partner.id,
        companyName: partner.companyName,
        email: partner.email,
        contactPerson: partner.contactPerson,
      },
    };
  }

  async userRegister(login: string, password: string, name?: string) {
    const user = await this.usersService.register(login, password, name);
    return {
      access_token: this.jwtService.sign({
        sub: String(user.id),
        role: "user",
        email: user.email,
        phone: user.phone,
        name: user.name,
      }),
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
    };
  }

  async userLogin(login: string, password: string) {
    const user = await this.usersService.findByLogin(login);
    if (!user || !this.usersService.validatePassword(user.passwordHash, password)) {
      throw new UnauthorizedException("Неверный логин или пароль");
    }

    return {
      access_token: this.jwtService.sign({
        sub: String(user.id),
        role: "user",
        email: user.email,
        phone: user.phone,
        name: user.name,
      }),
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
    };
  }

  async userMe(userId: number) {
    return this.usersService.findById(userId);
  }
}
