import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  login(@Body() body: { username: string; password: string }) {
    return this.authService.login(body.username, body.password);
  }

  @Post("partner-login")
  partnerLogin(@Body() body: { email: string; password: string }) {
    return this.authService.partnerLogin(body.email, body.password);
  }

  @Post("user/register")
  userRegister(@Body() body: { login: string; password: string; name?: string }) {
    return this.authService.userRegister(body.login, body.password, body.name);
  }

  @Post("user/login")
  userLogin(@Body() body: { login: string; password: string }) {
    return this.authService.userLogin(body.login, body.password);
  }

  @Get("user/me")
  @UseGuards(JwtAuthGuard)
  userMe(@Req() req: { user: { userId: string } }) {
    return this.authService.userMe(Number(req.user.userId));
  }
}
