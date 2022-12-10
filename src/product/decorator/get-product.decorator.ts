import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Product } from '../entity/product.entity';

export const GetProduct = createParamDecorator(
  (_data, ctx: ExecutionContext): Product => {
    const req = ctx.switchToHttp().getRequest();
    return req.product.id;
  },
);
