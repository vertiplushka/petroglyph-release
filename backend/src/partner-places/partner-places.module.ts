import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { PartnerPlacesController } from "./partner-places.controller";
import { PartnerPlacesService } from "./partner-places.service";

@Module({
  imports: [PrismaModule],
  controllers: [PartnerPlacesController],
  providers: [PartnerPlacesService],
})
export class PartnerPlacesModule {}
