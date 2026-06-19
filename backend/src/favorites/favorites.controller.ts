import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { FavoritesService } from "./favorites.service";

@Controller("favorites")
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  findAll(@Req() req: { user: { userId: string; role: string } }) {
    return this.favoritesService.findByUser(Number(req.user.userId));
  }

  @Post()
  create(
    @Req() req: { user: { userId: string; role: string } },
    @Body() body: { title: string; routeId?: number; placeIds?: number[] }
  ) {
    return this.favoritesService.create(Number(req.user.userId), body);
  }

  @Delete(":id")
  remove(
    @Param("id", ParseIntPipe) id: number,
    @Req() req: { user: { userId: string; role: string } }
  ) {
    return this.favoritesService.remove(id, Number(req.user.userId));
  }
}
