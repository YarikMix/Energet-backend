import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favourite } from '@entities/favourite/models/favourite.entity';
import { FavouriteService } from '@entities/favourite/service/favourite.service';
import { FavouriteController } from '@entities/favourite/controller/favourite.controller';
import { Item } from '@entities/items/models/item.entity';
import { ItemType } from '@entities/items/models/item-type.entity';
import { ItemProducer } from '@entities/items/models/item-producer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Favourite, Item, ItemType, ItemProducer]),
  ],
  controllers: [FavouriteController],
  providers: [FavouriteService],
})
export class FavouriteModule {}
