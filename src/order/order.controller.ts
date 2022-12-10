import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderService } from './order.service';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { User } from '../auth/entity/user.entity';
import { Order } from './entity/order.entity';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '../auth/roles/roles.enum';

@Controller('order')
@UseGuards(AuthGuard('jwt'))
export class OrderController {
  private logger = new Logger('TasksController');

  constructor(private ordersService: OrderService) {}

  @Get('/:id')
  getOrderById(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<Order> {
    return this.ordersService.getOrderById(id, user);
  }

  @Post()
  @Roles(Role.ADMIN)
  @UsePipes(ValidationPipe)
  createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @GetUser() user: User,
  ): Promise<Order> {
    this.logger.verbose(
      `User "${user.username}" creating a new order. Data: ${JSON.stringify(
        createOrderDto,
      )}`,
    );
    return this.ordersService.createOrder(createOrderDto, user);
  }

  @Delete('/:id')
  deleteOrder(
    @Param('id', ParseIntPipe) id: string,
    @GetUser() user: User,
  ): Promise<void> {
    return this.ordersService.deleteOrder(id, user);
  }

  @Patch('/:id')
  updateOrderStatus(
    @Param('id', ParseIntPipe) id: string,
    @Body() createOrderDto: CreateOrderDto,
    @GetUser() user: User,
  ): Promise<Order> {
    return this.ordersService.updateOrderStatus(id, createOrderDto, user);
  }
}
