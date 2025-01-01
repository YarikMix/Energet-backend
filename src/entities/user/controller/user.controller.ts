import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  Put,
  Delete,
  Param,
  ParseIntPipe,
  Body,
  UseInterceptors,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from '@entities/user/service/user.service';
import { UpdateUserDto } from '@entities/user/dto/updateUser.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/')
  async getAllUsers(@Req() req: Request, @Res() res: Response) {
    const usersData = await this.userService.getUsers();
    return res.send({ data: usersData });
  }

  @Get('/:id')
  async getUser(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const userData = await this.userService.getUserData(id);
    delete userData.password;
    return res.send({ data: userData });
  }

  @Post('/')
  @UseInterceptors(FileInterceptor(''))
  async createUser(@Req() req: Request, @Res() res: Response) {
    await this.userService.createUser(req.body);
    return res.status(200).send('created');
  }

  @Put('/:id')
  async updateUser(
    @Body() body: UpdateUserDto,
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    await this.userService.updateUserData(id, body);
    return res.send({ status: 'ok' });
  }
  @Delete('/:id')
  async deleteUser(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.userService.deleteUser(id);
    return res.send({ status: 'ok' });
  }
}
