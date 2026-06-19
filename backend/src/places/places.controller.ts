import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { PlaceType } from "@prisma/client";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PlacePayload, PlacesService } from "./places.service";

@Controller("places")
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Get()
  findAll(@Query("type") type?: PlaceType) {
    return this.placesService.findAll(type);
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.placesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body: PlacePayload & { id: number }) {
    return this.placesService.create(body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() body: PlacePayload) {
    return this.placesService.update(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.placesService.remove(id);
  }
}
