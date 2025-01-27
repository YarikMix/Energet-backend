import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterRequestDto } from './dtos/register-request.dto';
import { UsersService } from '@entities/user/service/user.service';
import { User } from '@entities/user/models/user.entity';
import { AuthPayload } from '@services/auth/types/AuthPayload';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user: User = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const isMatch: boolean = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      throw new BadRequestException('Password does not match');
    }
    return user;
  }

  async login(user: User): Promise<AuthPayload> {
    const payload = { email: user.email, id: user.id };
    const userInfo = await this.usersService.findOneByEmail(user.email);
    delete userInfo.password;
    return {
      user: userInfo,
      token: this.jwtService.sign(payload),
    };
  }

  async register(userRegisterInfo: RegisterRequestDto): Promise<AuthPayload> {
    const existingUser = await this.usersService.findOneByEmail(
      userRegisterInfo.email,
    );
    if (existingUser) {
      throw new BadRequestException('email already exists');
    }

    const hashedPassword = await bcrypt.hash(userRegisterInfo.password, 10);
    const newUserInfo: User = {
      ...userRegisterInfo,
      password: hashedPassword,
    } as User;

    const newUser = await this.usersService.create(newUserInfo);
    delete newUser.password;

    const payload = { email: userRegisterInfo.email, id: newUser.id };
    const token = this.jwtService.sign(payload);

    return {
      user: newUser,
      token: token,
    };
  }

  async getUserInfo(email: string): Promise<User> {
    const userInfo = await this.usersService.findOneByEmail(email);
    delete userInfo.password;
    return userInfo;
  }
}
