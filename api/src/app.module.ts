import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersModule } from '@entities/user/user.module';
import { OrderModule } from '@entities/order/order.module';
import { TypeOrmModule } from '@db/typeorm.module';
import { ConfigModule } from './config.module';
import { ItemsModule } from '@entities/items/items.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from '@services/auth/guards/jwt.guard';
import { AuthModule } from '@services/auth/auth.module';
import { MinioService } from '@services/minio/minio.service';
import { AppLoggerMiddleware } from './middleware/logger';
import { FavouriteModule } from '@entities/favourite/favourite.module';
import { ConfiguratorModule } from '@services/configurator/configurator.controller';

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
