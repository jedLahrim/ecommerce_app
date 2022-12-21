import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product } from './entity/product.entity';
import { Attachment } from './entity/attachment.entity';
import { S3Client } from '@aws-sdk/client-s3';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Attachment]), AuthModule],
  controllers: [ProductController],
  providers: [ProductService, S3Client],
})
export class ProductModule {}
