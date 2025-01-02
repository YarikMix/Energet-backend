import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  ParseIntPipe,
  Body,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from '@entities/user/service/user.service';
import { UpdateUserDto } from '@entities/user/dto/updateUser.dto';
import { NotFoundInterceptor } from '@interceptors/interceptors';
import { RegisterUserDto } from '@entities/user/dto/registerUser.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/')
  getAllUsers() {
    return this.userService.getUsers();
  }

  @Get('/:id')
  @UseInterceptors(NotFoundInterceptor)
  getUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUser(id);
  }

  @Post('/register')
  async registerUser(@Body() body: RegisterUserDto) {
    return this.userService.createUser(body);
  }

  // @Post('/auth')
  // async authUser(@Body() body: LoginUserDto) {
  //   return this.userService.getUsers(body);
  // }

  @Put('/:id')
  // @UseInterceptors(FileInterceptor(''))
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateUserDto,
  ) {
    return this.userService.updateUserData(id, body);
  }

  @Delete('/:id')
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.deleteUser(id);
  }
}
