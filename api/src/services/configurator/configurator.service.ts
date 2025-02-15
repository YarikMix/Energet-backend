import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ConfiguratorService {
  constructor(private readonly httpService: HttpService) {}

  async findAll(body) {
    const { data } = await firstValueFrom(
      this.httpService.post('http://configurator:5000/api/optim/', body),
    );

    return data;
  }
}
