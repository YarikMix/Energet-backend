import { Controller, Get, Query, Req } from '@nestjs/common';
import { FavouriteService } from '@entities/favourite/service/favourite.service';
import { PaginationDto } from '@entities/items/dto/pagination.dto';
import { ItemsFiltersDto } from '@entities/items/dto/filters.dto';
import { User } from '@services/auth/decorators/user.decorator';

@Controller('favourites')
export class FavouriteController {
  constructor(private readonly favouriteService: FavouriteService) {}

  @Get('/')
  searchFavourites(
    @Req() req,
    @Query() params: PaginationDto & ItemsFiltersDto,
    @User() user,
  ) {
    return this.favouriteService.search({ ...params, userId: user?.id });
  }
}
