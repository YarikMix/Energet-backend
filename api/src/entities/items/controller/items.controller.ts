import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  ParseIntPipe,
  UploadedFile,
  BadRequestException,
  Put,
  Query,
} from '@nestjs/common';
import { ItemsService } from '../service/items.service';
import { CreateItemDto } from '../dto/createItem.dto';
import { UpdateItemDto } from '../dto/updateItem.dto';
import { NotFoundInterceptor } from '@interceptors/interceptors';
import { Public } from '@services/auth/decorators/public.decorator';
import { MinioService } from '@services/minio/minio.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('items')
export class ItemsController {
  constructor(
    private readonly itemsService: ItemsService,
    private readonly minioService: MinioService,
  ) {}

  @Public()
  @Get('/')
  searchItems(@Query() params) {
    return this.itemsService.search({ name: params.name });
  }

  @Get('/:id')
  @UseInterceptors(NotFoundInterceptor)
  getItem(@Param('id', ParseIntPipe) id: number) {
    return this.itemsService.findOne(id);
  }

  @Public()
  @Post('/')
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() createItemDto: CreateItemDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const item = await this.itemsService.create(
      createItemDto,
      file && file.originalname,
    );

    if (file) await this.minioService.uploadFile(`/items/${item.id}/`, file);

    return item;
  }

  @Public()
  @Put('/:id/update/')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateItemDto: UpdateItemDto,
  ) {
    return this.itemsService.update(id, updateItemDto);
  }

  @Public()
  @Put('/:id/update_image/')
  @UseInterceptors(FileInterceptor('file'))
  async updateImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException();
    }

    await this.minioService.uploadFile(`/items/${id}/`, file);

    await this.itemsService.updateImage(id, file.originalname);

    return this.itemsService.findOne(id);
  }

  @Delete('/:id')
  remove(@Param('id') id: string) {
    return this.itemsService.remove(+id);
  }

  @Post('/:item_id/add_to_order/:order_id')
  addToOrder(
    @Param('item_id', ParseIntPipe) item_id: number,
    @Param('order_id', ParseIntPipe) order_id: number,
  ) {
    return this.itemsService.addItemTodOrder(item_id, order_id);
  }

  @Post('/:item_id/delete_from_order/:order_id')
  deleteFromOrder(
    @Param('item_id', ParseIntPipe) item_id: number,
    @Param('order_id', ParseIntPipe) order_id: number,
  ) {
    return this.itemsService.deleteItemFromOrder(item_id, order_id);
  }
}
