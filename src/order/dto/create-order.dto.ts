import { IsJSON, IsNotEmpty, IsNumber, IsObject } from 'class-validator';
import { CreateDateColumn } from 'typeorm';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsNumber()
  subTotal: number;

  @IsNotEmpty()
  @IsNumber()
  discount: number;

  @IsNotEmpty()
  @IsNumber()
  delivery: number;

  @IsNotEmpty()
  @IsObject()
  cartProduct: JSON;
}
