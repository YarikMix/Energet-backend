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
  Res,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { ItemsService } from '../service/items.service';
import { CreateItemDto } from '../dto/createItem.dto';
import { UpdateItemDto } from '../dto/updateItem.dto';
import { NotFoundInterceptor } from '@interceptors/interceptors';
import { Public } from '@services/auth/decorators/public.decorator';
import { MinioService } from '@services/minio/minio.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaginationDto } from '@entities/items/dto/pagination.dto';
import { ItemsFiltersDto } from '@entities/items/dto/filters.dto';
import { User } from '@services/auth/decorators/user.decorator';

@Controller('items')
export class ItemsController {
  constructor(
    private readonly itemsService: ItemsService,
    private readonly minioService: MinioService,
  ) {}

  @Public()
  @Get('/types')
  getTypes() {
    return this.itemsService.findTypes();
  }

  @Public()
  @Get('/producers')
  getProducers() {
    return this.itemsService.findProducers();
  }

  @Public()
  @Get('/')
  searchItems(
    @Req() req,
    @Query() params: PaginationDto & ItemsFiltersDto,
    @User() user,
  ) {
    return this.itemsService.search({ ...params, userId: user?.id });
  }

  @Public()
  @Get('/:id')
  @UseInterceptors(NotFoundInterceptor)
  getItem(@Param('id', ParseIntPipe) id: number, @User() user) {
    return this.itemsService.findOne(id, user.id);
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
    return this.itemsService.addItemToOrder(item_id, order_id);
  }

  @Post('/:item_id/delete_from_order/:order_id')
  deleteFromOrder(
    @Param('item_id', ParseIntPipe) item_id: number,
    @Param('order_id', ParseIntPipe) order_id: number,
  ) {
    return this.itemsService.deleteItemFromOrder(item_id, order_id);
  }

  @Post('/:id/add_to_favourites')
  async addItemToFavourite(
    @Res({ passthrough: true }) res,
    @Param('id') id: number,
    @User() user,
  ) {
    const isFavouriteItem = await this.itemsService.isFavouriteItem(
      id,
      user.id,
    );

    if (isFavouriteItem) {
      res.status(HttpStatus.CONFLICT).send();
      return;
    }

    return this.itemsService.addItemToFavourite(id, user.id);
  }

  @Delete('/:id/delete_from_favourites')
  removeItemFromFavourite(@Param('id') id: number, @User() user) {
    return this.itemsService.removeItemFromFavourite(id, user.id);
  }
}
