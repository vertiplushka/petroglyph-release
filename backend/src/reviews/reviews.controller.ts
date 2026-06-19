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
import { ReviewStatus } from "@prisma/client";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateReviewDto, ReviewsService } from "./reviews.service";

@Controller("reviews")
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  findAll(
    @Query("status") status?: string,
    @Query("placeId") placeId?: string,
    @Query("routeId") routeId?: string,
  ) {
    return this.reviewsService.findAll(
      status as ReviewStatus | undefined,
      placeId ? parseInt(placeId, 10) : undefined,
      routeId ? parseInt(routeId, 10) : undefined,
    );
  }

  @Post()
  create(@Body() body: CreateReviewDto) {
    return this.reviewsService.create(body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id/approve")
  approve(@Param("id", ParseIntPipe) id: number) {
    return this.reviewsService.approve(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id/reject")
  reject(@Param("id", ParseIntPipe) id: number) {
    return this.reviewsService.reject(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.reviewsService.remove(id);
  }
}
