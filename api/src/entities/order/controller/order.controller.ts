import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { OrderService } from '@entities/order/service/order.service';
import { UpdateOrderDto } from '@entities/order/dto/updateOrder.dto';
import { NotFoundInterceptor } from '@interceptors/interceptors';
import { User } from '@services/auth/decorators/user.decorator';
import { UpdateOrderItemCountDto } from '@entities/order/dto/updateOrderItemCount.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('/draft')
  getDraftOrder(@User() user) {
    return this.orderService.getDraftOrder(user.id);
  }

  @Get('/')
  getAllOrders(@User() user) {
    return this.orderService.getOrders(user);
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
    const draftOrder = await this.orderService.getDraftOrder(user);
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
}
