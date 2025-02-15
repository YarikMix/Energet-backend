import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfiguratorController } from '@services/configurator/configurator.module';
import { ConfiguratorService } from '@services/configurator/configurator.service';

@Module({
  imports: [HttpModule],
  controllers: [ConfiguratorController],
  providers: [ConfiguratorService],
  exports: [],
})
export class ConfiguratorModule {}
