import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  ParseIntPipe,
  Body,
  UseInterceptors,
} from '@nestjs/common';
import { UpdateUserDto } from '@entities/user/dto/updateUser.dto';
import { NotFoundInterceptor } from '@interceptors/interceptors';
import { UsersService } from '@entities/user/service/user.service';

@Controller('users')
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/')
  getAllUsers() {
    return this.usersService.getUsers();
  }

  @Get('/:id')
  @UseInterceptors(NotFoundInterceptor)
  getUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUser(id);
  }

  @Put('/:id')
  // @UseInterceptors(FileInterceptor(''))
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateUserDto,
  ) {
    return this.usersService.updateUserData(id, body);
  }

  @Delete('/:id')
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteUser(id);
  }
}
