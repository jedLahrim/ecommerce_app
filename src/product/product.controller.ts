import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { ProductService } from './product.service';
import { GetProductsPaginationDto } from './dto/get-product-pagination.dto';
import { PaginatedResult } from './dto/paginated-result.dto';
import { Product } from './entity/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { GetProductsFilterDto } from './dto/get-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadProductAttachmentDto } from './dto/upload-product-attachment.dto';

@Controller('product')
@UseGuards(AuthGuard('jwt'))
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get()
  getProducts(
    @Query(ValidationPipe) filterDto: GetProductsFilterDto,
  ): Promise<Product[]> {
    return this.productService.getProducts(filterDto);
  }

  @Get('pagination')
  getProductsWithPagination(
    @Query() getProductsPaginationDto: GetProductsPaginationDto,
  ): Promise<PaginatedResult<Product>> {
    return this.productService.getTasksWithPagination(getProductsPaginationDto);
  }

  // @Get('/:id')
  // getProductsById(@Param('id', ParseIntPipe) id: string): Promise<Product> {
  //   return this.productService.getProductById(id);
  // }

  @Post('/:upload')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadAttachmentDto: UploadProductAttachmentDto,
  ) {
    return await this.productService.uploadFile(file, uploadAttachmentDto);
  }

  @Get('/:id')
  @UseGuards(AuthGuard('jwt'))
  async download(@Param('id') id: string) {
    return await this.productService.download(id);
  }

  @Post()
  @UsePipes(ValidationPipe)
  createTask(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productService.createProduct(createProductDto);
  }

  @Delete('/:id')
  deleteTask(@Param('id', ParseIntPipe) id: string): Promise<void> {
    return this.productService.deleteProduct(id);
  }

  @Patch('/:id')
  updateProductStatus(
    @Param('id', ParseIntPipe) id: string,
    @Body() createProductDto: CreateProductDto,
  ): Promise<Product> {
    return this.productService.updateProducts(id, createProductDto);
  }
}
