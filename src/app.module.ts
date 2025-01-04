import { Module } from '@nestjs/common';
import { UsersModule } from '@entities/user/user.module';
import { OrderModule } from '@entities/order/order.module';
import { TypeOrmModule } from '@db/typeorm.module';
import { ConfigModule } from './config.module';
import { ItemsModule } from '@entities/items/items.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from '@services/auth/guards/jwt.guard';
import { AuthModule } from '@services/auth/auth.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule,
    OrderModule,
    ItemsModule,
    UsersModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
})
export class AppModule {}
