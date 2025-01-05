import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@entities/user/models/user.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async run() {
    // Clear existing data
    await this.userRepository.clear();

    // Seed new data
    const users = [
      { username: 'JohnDoe', password: 'password' },
      { username: 'JaneDoe', password: 'password' },
    ];

    await this.userRepository.save(users);
  }
}
