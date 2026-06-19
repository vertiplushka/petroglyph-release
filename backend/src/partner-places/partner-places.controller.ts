import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { GetUser } from "../common/get-user.decorator";
import { PartnerPlacePayload, PartnerPlacesService } from "./partner-places.service";

@Controller("partner-places")
@UseGuards(JwtAuthGuard)
export class PartnerPlacesController {
  constructor(private readonly service: PartnerPlacesService) {}

  @Get()
  findAll(@GetUser() user: { partnerId?: number }) {
    return this.service.findAllOwn(user.partnerId!);
  }

  @Get(":id")
  findOne(
    @Param("id", ParseIntPipe) id: number,
    @GetUser() user: { partnerId?: number }
  ) {
    return this.service.findOwnPlace(id, user.partnerId!);
  }

  @Post("subscribe")
  subscribe(
    @Body() body: { plan: "monthly" | "annual" },
    @GetUser() user: { partnerId?: number }
  ) {
    return this.service.subscribe(user.partnerId!, body.plan);
  }

  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: PartnerPlacePayload,
    @GetUser() user: { partnerId?: number }
  ) {
    return this.service.updateOwnPlace(id, body, user.partnerId!);
  }
}
