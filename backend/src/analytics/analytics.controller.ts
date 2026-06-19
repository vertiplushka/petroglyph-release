import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AnalyticsService } from "./analytics.service";

@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post("events")
  trackEvent(@Body() body: { placeId: number; eventType: "view" | "ai_show" }) {
    return this.analyticsService.trackEvent(body.placeId, body.eventType);
  }

  @UseGuards(JwtAuthGuard)
  @Get("partner/:id")
  getPartnerAnalytics(
    @Param("id", ParseIntPipe) id: number,
    @Query("period") period: "today" | "week" | "month" = "today",
    @Query("placeId") placeId?: string
  ) {
    return this.analyticsService.getPartnerAnalytics(
      id,
      period,
      placeId ? Number(placeId) : undefined
    );
  }
}
