import { TypeOrmModule } from '@db/typeorm.module';
import { DraftModule } from '@entities/draft/draft.module';
import { FavouriteModule } from '@entities/favourite/favourite.module';
import { ItemsModule } from '@entities/items/items.module';
import { OrderModule } from '@entities/order/order.module';
import { UsersModule } from '@entities/user/user.module';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from '@services/auth/auth.module';
import { JwtGuard } from '@services/auth/guards/jwt.guard';
import { ConfiguratorModule } from '@services/configurator/configurator.module';
import { MinioService } from '@services/minio/minio.service';
import { ConfigModule } from './config.module';
import { AppLoggerMiddleware } from './middleware/logger';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule,
    OrderModule,
    ItemsModule,
    UsersModule,
    AuthModule,
    FavouriteModule,
    ConfiguratorModule,
    DraftModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
    MinioService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}
