import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { OrderService } from '@entities/order/service/order.service';
import { UpdateOrderDto } from '@entities/order/dto/updateOrder.dto';
import { NotFoundInterceptor } from '@interceptors/interceptors';
import { User } from '@services/auth/decorators/user.decorator';
import { Public } from '@services/auth/decorators/public.decorator';
import { UpdateOrderItemCountDto } from '@entities/order/dto/updateOrderItemCount.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('/draft')
  getDraftOrder(@Req() req: Request, @User() user) {
    return this.orderService.getDraftOrder(user);
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
  createOrder() {
    return this.orderService.createOrder();
  }

  @Put('/:id')
  updateOrder(
    @Body() body: UpdateOrderDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.orderService.updateOrder(id, body);
  }

  @Public()
  @Put('/:id/update_item/:item_id')
  async updateItemCount(
    @Body() body: UpdateOrderItemCountDto,
    @Param('id', ParseIntPipe) order_id: number,
    @Param('item_id', ParseIntPipe) item_id: number,
  ) {
    await this.orderService.updateItemCount(order_id, item_id, body);
    return this.orderService.getOrder(order_id);
  }
}
