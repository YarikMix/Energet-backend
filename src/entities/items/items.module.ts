import { Module } from '@nestjs/common';
import { ItemsService } from './service/items.service';
import { ItemsController } from './controller/items.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from '@entities/items/models/item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Item])],
  controllers: [ItemsController],
  providers: [ItemsService],
})
export class ItemsModule {}
