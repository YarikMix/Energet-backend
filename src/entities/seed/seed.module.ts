import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from '@entities/seed/seed.service';
import { UsersModule } from '@entities/user/user.module';

@Module({
  imports: [UsersModule, TypeOrmModule],
  providers: [SeedService],
})
export class SeedModule {}
