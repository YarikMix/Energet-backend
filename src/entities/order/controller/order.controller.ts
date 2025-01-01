import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { OrderService } from '@entities/order/service/order.service';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('/')
  async getAllOrders(@Req() req: Request, @Res() res: Response) {
    const usersData = await this.orderService.getOrders();
    return res.send({ data: usersData });
  }

  @Post('/')
  async createOrder(@Req() req: Request, @Res() res: Response) {
    await this.orderService.createOrder(req.body);
    return res.status(200).send('created');
  }
}
