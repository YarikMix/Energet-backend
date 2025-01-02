import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { OrderService } from '@entities/order/service/order.service';
import { UpdateOrderDto } from '@entities/order/dto/updateOrder.dto';
import { NotFoundInterceptor } from '@interceptors/interceptors';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('/')
  getAllOrders() {
    return this.orderService.getOrders();
  }

  @Get('/:id')
  @UseInterceptors(NotFoundInterceptor)
  getOrder(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
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
}
