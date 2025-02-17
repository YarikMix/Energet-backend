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

@Controller('configurator')
export class ConfiguratorController {
  constructor(private readonly configuratorService: ConfiguratorService) {}

  @Post('/')
  async calc(
    @Request() req,
    @Res({ passthrough: true }) res: Response,
    @Body() body,
  ) {
    // console.log('body', body);

    const data = await this.configuratorService.calc(body);

    if (!data) {
      res.status(HttpStatus.BAD_REQUEST).send();
    }

    res.status(HttpStatus.OK).send(data);
  }
}
