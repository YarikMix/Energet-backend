import { DeleteOrderItemsDto } from '@entities/order/dto/deleteOrderItems.dto';
import { OrdersFiltersDto } from '@entities/order/dto/OrdersFiltersDto';
import { UpdateOrderDto } from '@entities/order/dto/updateOrder.dto';
import { UpdateOrderItemCountDto } from '@entities/order/dto/updateOrderItemCount.dto';
import { OrderService } from '@entities/order/service/order.service';
import { NotFoundInterceptor } from '@interceptors/interceptors';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { User } from '@services/auth/decorators/user.decorator';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('/draft')
  getDraftOrder(@User() user) {
    return this.orderService.getDraftOrder(user.id);
  }

  @Get('/')
  getOrders(@Query() params: OrdersFiltersDto, @User() user) {
    return this.orderService.getOrders(user.id, params.status);
  }

  @Get('/:id')
  @UseInterceptors(NotFoundInterceptor)
  getOrder(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.getOrder(id);
  }

  @Post('/')
  createOrder(@User() user) {
    return this.orderService.createOrder(user);
  }

  @Put('/:id')
  updateOrder(
    @Body() body: UpdateOrderDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.orderService.updateOrder(id, body);
  }

  @Delete('/draft')
  async deleteDraftOrder(@User() user) {
    const draftOrder = await this.orderService.getDraftOrder(user.id);
    return this.orderService.deleteOrder(draftOrder.id);
  }

  @Put('/:id/update_item/:item_id')
  async updateItemCountInOrder(
    @Body() body: UpdateOrderItemCountDto,
    @Param('id', ParseIntPipe) order_id: number,
    @Param('item_id', ParseIntPipe) item_id: number,
  ) {
    await this.orderService.updateItemCount(order_id, item_id, body);
    return this.orderService.getOrder(order_id);
  }

  @Post('/:id/delete_items/')
  async deleteItemsInOrder(
    @Body() body: DeleteOrderItemsDto,
    @Param('id', ParseIntPipe) order_id: number,
    @User() user,
  ) {
    await this.orderService.removeItemsFromOrder(order_id, body.items);
    const draftOrder = await this.orderService.getOrder(order_id, user.id);
    // TODO: Нунжно ли уалять черновой заказ после очистки корзины?
    return draftOrder;
  }

  @Delete('/:id/delete_item/:item_id')
  async deleteItemInOrder(
    @Param('id', ParseIntPipe) order_id: number,
    @Param('item_id', ParseIntPipe) item_id: number,
    @User() user,
  ) {
    await this.orderService.removeItemFromOrder(order_id, item_id);
    const draftOrder = await this.orderService.getOrder(order_id, user.id);
    // TODO: Нунжно ли уалять черновой заказ после очистки корзины?
    return draftOrder;
  }

  @Post('/add_item_to_draft_order/:item_id')
  async addItemToOrder(
    @Param('item_id', ParseIntPipe) item_id: number,
    @User() user,
  ) {
    let draftOrder = await this.orderService.getDraftOrder(user.id);

    if (!draftOrder) {
      draftOrder = await this.orderService.createOrder(user);
    }

    await this.orderService.addItemToOrder(draftOrder.id, item_id);

    return this.orderService.getOrder(draftOrder.id, user.id);
  }

  @Post('/add_items_to_draft_order/')
  async addItemsToOrder(@Body() items, @User() user) {
    let draftOrder = await this.orderService.getDraftOrder(user.id);

    if (!draftOrder) {
      draftOrder = await this.orderService.createOrder(user);
    }

    await this.orderService.addItemsToOrder(draftOrder.id, items);

    return this.orderService.getOrder(draftOrder.id, user.id);
  }

  @Put('/:id/update_status_user')
  async updateOrderStatusUser(
    @Res({ passthrough: true }) res,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.orderService.updateOrderStatusUser(id);
    res.status(HttpStatus.OK).send();
  }
}
