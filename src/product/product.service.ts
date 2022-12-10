import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppError } from '../commons/errors/app-error';
import { GetProductsPaginationDto } from './dto/get-product-pagination.dto';
import { PaginatedResult } from './dto/paginated-result.dto';
import { Product } from './entity/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { GetProductsFilterDto } from './dto/get-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async getProducts(filterDto: GetProductsFilterDto): Promise<Product[]> {
    const { search } = filterDto;
    const query = this.productRepository.createQueryBuilder('product');

    if (search) {
      query.andWhere('(product.name LIKE :search)', { search: `%${search}%` });
    }

    const products = await query.getMany();
    return products;
  }

  async getTasksWithPagination(
    getProductsPaginationDto: GetProductsPaginationDto,
  ): Promise<PaginatedResult<Product>> {
    const { search, page, pageSize } = getProductsPaginationDto;
    const query = this.productRepository.createQueryBuilder('product');

    if (search) {
      query.andWhere('(product.name LIKE :search)', { search: `%${search}%` });
    }
    const total = await query.getCount();
    query.offset((page - 1) * pageSize);
    query.limit(pageSize);

    const products = await query.getMany();

    return {
      products: products,
      pagination: {
        total,
        pageSize,
        page,
      },
    };
  }

  async getProductById(id: string): Promise<Product> {
    const found = await this.productRepository.findOneBy({ id });

    if (!found) {
      throw new NotFoundException(
        new AppError('ERR', `Task with ID "${id}" not found`),
      );
    }

    return found;
  }

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    const { name, price, discount, description } = createProductDto;

    const product = new Product();
    product.name = name;
    product.price = price;
    product.discount = discount;
    product.description = description;

    try {
      await product.save();
    } catch (error) {
      throw new InternalServerErrorException();
    }

    return product;
  }

  async deleteProduct(id: string): Promise<void> {
    const result = await this.productRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(
        new AppError('ERR', `Task with ID "${id}" not found`),
      );
    }
  }

  async updateProducts(
    id: string,
    createProductDto: CreateProductDto,
  ): Promise<Product> {
    const { name, price, discount, description } = createProductDto;

    const product = await this.getProductById(id);
    product.name = name;
    product.price = price;
    product.discount = discount;
    product.description = description;
    await product.save();
    return product;
  }
}
