import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Draft } from '@entities/draft/models/draft.entity';
import { User } from '@entities/user/models/user.entity';
import { DraftController } from '@entities/draft/controller/draft.controller';
import { DraftService } from '@entities/draft/service/draft.service';

@Module({
  imports: [TypeOrmModule.forFeature([Draft, User])],
  controllers: [DraftController],
  providers: [DraftService],
})
export class DraftModule {}
