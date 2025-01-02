import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  ParseIntPipe,
} from '@nestjs/common';
import { ItemsService } from '../service/items.service';
import { CreateItemDto } from '../dto/createItem.dto';
import { UpdateItemDto } from '../dto/updateItem.dto';
import { NotFoundInterceptor } from '@interceptors/interceptors';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get('/')
  searchItems() {
    return this.itemsService.findAll();
  }

  @Get('/:id')
  @UseInterceptors(NotFoundInterceptor)
  getItem(@Param('id', ParseIntPipe) id: number) {
    return this.itemsService.findOne(id);
  }

  @Post('/')
  create(@Body() createItemDto: CreateItemDto) {
    return this.itemsService.create(createItemDto);
  }

  @Patch('/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateItemDto: UpdateItemDto,
  ) {
    return this.itemsService.update(id, updateItemDto);
  }

  @Delete('/:id')
  remove(@Param('id') id: string) {
    return this.itemsService.remove(+id);
  }
}
