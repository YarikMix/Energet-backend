import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { genSalt, hash } from 'bcrypt';

import { User } from '../models/user.entity';
import { UpdateUserDto } from '@entities/user/dto/updateUser.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  availableFields = ['name', 'phone', 'email', 'userType'];

  private filterFields(body: { [k: string]: any }) {
    const filteredBody: { [k: string]: any } = {};

    Object.keys(body).filter((k) => {
      if (this.availableFields.includes(k)) {
        filteredBody[k] = body[k];
      }
    });

    return filteredBody;
  }

  public async createUser(userData: any) {
    const salt = await genSalt(10);
    const hashedPassword = await hash(userData.password, salt);

    const newUser = this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });
    return await this.userRepository.save(newUser);
  }

  public async getUserData(id: number) {
    return await this.userRepository.findOne({
      where: { id },
      select: [...(this.availableFields as any), 'id'],
    });
  }

  public async updateUserData(id: number, body: UpdateUserDto) {
    const data = this.filterFields(body);
    console.log(Object.keys(data).length);
    if (!Object.keys(data).length) {
      return null;
    }

    return await this.userRepository.update({ id }, this.filterFields(body));
  }

  public async getUsers() {
    return await this.userRepository.find({
      select: [...(this.availableFields as any), 'id'],
    });
  }

  public async deleteUser(id: number) {
    return await this.userRepository.delete(id);
  }
}
