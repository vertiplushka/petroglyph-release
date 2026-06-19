import { Body, Controller, Get, Headers, Patch, UnauthorizedException, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { SettingsService } from "./settings.service";

@Controller("settings")
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // Admin: masked API key, for display in admin panel
  @UseGuards(JwtAuthGuard)
  @Get()
  getPublic() {
    return this.settingsService.getAIConfigPublic();
  }

  // Admin: update AI config
  @UseGuards(JwtAuthGuard)
  @Patch()
  update(@Body() body: { baseUrl?: string; model?: string; apiKey?: string }) {
    return this.settingsService.updateAIConfig(body);
  }

  // Internal: full config including API key — only for Next.js chat route via internal network
  @Get("internal")
  getInternal(@Headers("x-internal-secret") secret: string) {
    const expected = process.env.INTERNAL_SECRET ?? "";
    if (!expected || secret !== expected) throw new UnauthorizedException();
    return this.settingsService.getAIConfig();
  }
}
