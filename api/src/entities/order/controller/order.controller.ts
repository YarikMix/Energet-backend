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
import { Public } from '@services/auth/decorators/public.decorator';
import { User } from '@services/auth/decorators/user.decorator';

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
}
