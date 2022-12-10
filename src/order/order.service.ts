import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entity/order.entity';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { User } from '../auth/entity/user.entity';
import { AppError } from '../commons/errors/app-error';

@Injectable()
export class OrderService {
  private logger = new Logger('Order');

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getOrderById(id: string & any, user: User & any): Promise<Order> {
    const found = await this.orderRepository.findOne({
      where: { id, userId: user.id },
    });

    if (!found) {
      throw new NotFoundException(`Order with ID "${id}" not found`);
    }

    return found;
  }

  async createOrder(
    createOrderDto: CreateOrderDto,
    user: User,
  ): Promise<Order> {
    const admin = await this.userRepository.findOneBy({
      username: 'joliX007',
      email: 'joliX007@gmail.com',
    });
    if (admin.id !== user.id) {
      throw new NotFoundException(
        new AppError('ERR', 'only admins have access to this place'),
      );
    } else {
      const { subTotal, discount, delivery, cartProduct } = createOrderDto;
      const order = await this.orderRepository.create({
        subTotal,
        discount,
        delivery,
        cartProduct,
      });

      try {
        order.userId = user.id;
        await this.orderRepository.save(order);
      } catch (error) {
        this.logger.error(
          `Failed to create a task for user "${user.username}". Data: ${createOrderDto}`,
          error.stack,
        );
        throw new InternalServerErrorException(new AppError('ERR', '404'));
      }

      //   delete order.user;
      return order;
    }
  }

  async deleteOrder(id: any, user: User): Promise<void> {
    const result = await this.orderRepository.delete({ id, userId: user.id });

    if (result.affected === 0) {
      throw new NotFoundException(
        new AppError('ERR', `Order with ID "${id}" not found`),
      );
    }
  }

  async updateOrderStatus(
    id: string,
    createOrderDto: CreateOrderDto,
    user: User,
  ): Promise<Order> {
    const { subTotal, discount, delivery, cartProduct } = createOrderDto;

    const order = await this.getOrderById(id, user);
    order.subTotal = subTotal;
    order.discount = discount;
    order.delivery = delivery;
    order.cartProduct = cartProduct;
    await order.save();
    return order;
  }
}
