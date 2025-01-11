import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './models/user.entity';
import { UserController } from '@entities/user/controller/user.controller';
import { UsersService } from '@entities/user/service/user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [TypeOrmModule, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
