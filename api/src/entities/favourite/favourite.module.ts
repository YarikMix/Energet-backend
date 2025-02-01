import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favourite } from '@entities/favourite/models/favourite.entity';
import { FavouriteService } from '@entities/favourite/service/favourite.service';
import { FavouriteController } from '@entities/favourite/controller/favourite.controller';
import { Item } from '@entities/items/models/item.entity';
import { ItemType } from '@entities/items/models/item-type.entity';
import { ItemProducer } from '@entities/items/models/item-producer.entity';
import { User } from '@entities/user/models/user.entity';
import { UsersService } from '@entities/user/service/user.service';
import { OrderItem } from '@entities/order/models/order-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Favourite,
      Item,
      ItemType,
      ItemProducer,
      User,
      OrderItem,
    ]),
  ],
  controllers: [FavouriteController],
  providers: [FavouriteService, UsersService],
})
export class FavouriteModule {}
