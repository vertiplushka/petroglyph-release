import { Module } from "@nestjs/common";
import { AnalyticsModule } from "./analytics/analytics.module";
import { AuthModule } from "./auth/auth.module";
import { BookingsModule } from "./bookings/bookings.module";
import { FavoritesModule } from "./favorites/favorites.module";
import { PartnerPlacesModule } from "./partner-places/partner-places.module";
import { PartnersModule } from "./partners/partners.module";
import { PlacesModule } from "./places/places.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ReviewsModule } from "./reviews/reviews.module";
import { RoutesModule } from "./routes/routes.module";
import { SettingsModule } from "./settings/settings.module";
import { UploadModule } from "./upload/upload.module";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    PartnersModule,
    PlacesModule,
    RoutesModule,
    ReviewsModule,
    UploadModule,
    SettingsModule,
    AnalyticsModule,
    BookingsModule,
    PartnerPlacesModule,
    FavoritesModule,
  ],
})
export class AppModule {}
