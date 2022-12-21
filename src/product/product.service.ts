import {
  ConflictException,
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
import fs, { createWriteStream } from 'fs';
import { UploadProductAttachmentDto } from './dto/upload-product-attachment.dto';
import { Attachment } from './entity/attachment.entity';
import { ERR_UPLOAD_FAILED } from '../commons/errors/errors-codes';
import { ConfigService } from '@nestjs/config';
import {
  PutObjectCommand,
  PutObjectCommandInput,
  PutObjectCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';
import { rethrow } from '@nestjs/core/helpers/rethrow';
import S3 from 'aws-sdk/clients/s3';
import { deserializeAws_restXmlAbortMultipartUploadCommand } from '@aws-sdk/client-s3/dist-types/protocols/Aws_restXml';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Attachment)
    private attachmentRepo: Repository<Attachment>,
    private configService: ConfigService,
    private s3: S3Client,
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

  async upload(file, uploadAttachmentDto: UploadProductAttachmentDto) {
    const { attchment } = uploadAttachmentDto;
    const product = this.attachmentRepo.create({
      attchment,
    });
    // if (!product.) product.event = null;
    try {
      const media_path = this.configService.get('MEDIA_PATH');
      const path = `${media_path}${file.originalname}`;
      const fileStream = createWriteStream(path);
      // [fileStream.path] = [path];
      fileStream.write(file.buffer);
      fileStream.end();
      product.attchment = path;
      // product.name = name;
      return this.attachmentRepo.save(product);
    } catch (e) {
      console.log(e);
      throw new NotFoundException(new AppError(ERR_UPLOAD_FAILED));
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    uploadAttachmentDto: UploadProductAttachmentDto,
  ): Promise<Attachment> {
    try {
      const { attchment } = uploadAttachmentDto;
      const attachment = this.attachmentRepo.create({
        attchment,
      });
      const bucket = this.configService.get('AWS_BACKET_NAME');
      const region = this.configService.get('AWS_BACKET_REGION');
      const input: PutObjectCommandInput = {
        Body: file.buffer,
        Bucket: bucket,
        Key: file.originalname,
        ContentType: file.mimetype,
        ACL: 'public-read',
      };

      try {
        const accessKeyId = this.configService.get('AWS_ACCESS_KEY');
        const secretAccessKey = this.configService.get('AWS_SECRET_KEY');
        const S3 = require('aws-sdk/clients/s3');
        const s3 = new S3({
          region: region,
          credentials: {
            accessKeyId: accessKeyId,
            secretAccessKey: secretAccessKey,
          },
        });
        const fs = require('fs');
        const pathMedia = this.configService.get('MEDIA_PATH');
        const path = `${pathMedia}${file.originalname}`;
        const fileStream = fs.createWriteStream(path);
        attachment.attchment = file.originalname;
        attachment.file = path;
        await s3.upload(input).promise();
        await this.attachmentRepo.save(attachment);
        return attachment;
        // throw new ConflictException('file not saved on aws s3');
      } catch (err) {
        console.log(err);
        rethrow('Cannot save file to s3');
        throw err;
      }
    }catch (e) {
      console.log(e)
      throw new ConflictException('Cannot save file to s3')
    }
  }

  async download(id: string) {
    const attachement = await this.attachmentRepo.findOneBy({ id: id });
    const fileName = attachement.attchment;
    const S3 = require('aws-sdk/clients/s3');
    const bucketName = this.configService.get('AWS_BACKET_NAME');
    const region = this.configService.get('AWS_BACKET_REGION');
    const input: PutObjectCommandInput = {
      Bucket: bucketName,
      Key: fileName,
    };
    const accessKeyId = this.configService.get('AWS_ACCESS_KEY');
    const secretAccessKey = this.configService.get('AWS_SECRET_KEY');
    // const S3 = require('aws-sdk/clients/s3');
    const s3 = new S3({
      region: region,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    });
    const t = await s3.getObject(input).createReadStream();
    return t;
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
