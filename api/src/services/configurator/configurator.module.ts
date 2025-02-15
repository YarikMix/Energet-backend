import { Public } from '@services/auth/decorators/public.decorator';
import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Request,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ConfiguratorService } from '@services/configurator/configurator.service';

@Public()
@Controller('optim')
export class ConfiguratorController {
  constructor(private readonly configuratorService: ConfiguratorService) {}

  @Post('/')
  async test(
    @Request() req,
    @Res({ passthrough: true }) res: Response,
    @Body() body,
  ) {
    console.log('test');

    console.log('body', body);

    const data = await this.configuratorService.findAll(body);

    const test = { data };
    res.status(HttpStatus.OK).send(test);
  }
}
