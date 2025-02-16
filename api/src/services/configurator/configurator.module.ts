import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfiguratorController } from '@services/configurator/configurator.controller';
import { ConfiguratorService } from '@services/configurator/configurator.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from '@entities/items/models/item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Item]), HttpModule],
  controllers: [ConfiguratorController],
  providers: [ConfiguratorService],
  exports: [],
})
export class ConfiguratorModule {}
