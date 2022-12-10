import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRatingDto } from './dto/create-rating.dto';
import { GetRatingsFilterDto } from './dto/get-rating.dto';
import { Rating } from './entity/rating.entity';
import { Product } from '../product/entity/product.entity';
import { AppError } from '../commons/errors/app-error';

@Injectable()
export class RatingService {
  private logger = new Logger('Order');

  constructor(
    @InjectRepository(Rating)
    private ratingRepository: Repository<Rating>,
  ) {}

  async getRatings(
    filterDto: GetRatingsFilterDto,
    product: Product,
  ): Promise<Rating[]> {
    const { search } = filterDto;
    const query = this.ratingRepository.createQueryBuilder('rating');
    query.where('rating.productId = :productId', { productId: product.id });

    if (search) {
      query.andWhere('(rating.userId LIKE :search)', { search: `%${search}%` });
    }

    try {
      const ratings = await query.getMany();
      return ratings;
    } catch (error) {
      this.logger.error(
        `Failed to get ratings for products "${
          product.name
        }". Filters: ${JSON.stringify(filterDto)}`,
        error.stack,
      );
      throw new InternalServerErrorException(new AppError('ERR', '404'));
    }
  }

  async getRatingById(
    id: string | any,
    product: Product & any,
  ): Promise<Rating> {
    const found = await this.ratingRepository.findOne({
      where: { id, productId: product.id },
    });

    if (!found) {
      throw new NotFoundException(`Order with ID "${id}" not found`);
    }

    return found;
  }

  async createRating(
    createRatingDto: CreateRatingDto,
    product: Product,
  ): Promise<Rating> {
    const { rating, userId } = createRatingDto;

    const ratings = new Rating();
    ratings.rating = rating;
    ratings.userId = userId;
    ratings.product = product;
    try {
      await ratings.save();
    } catch (error) {
      this.logger.error(`Failed to create a rating for products `);
      throw new InternalServerErrorException();
    }

    delete ratings.product;
    return ratings;
  }

  async updateRating(
    id: number,
    createRatingDto: CreateRatingDto,
    product: Product,
  ): Promise<Rating> {
    const { rating, userId } = createRatingDto;

    const ratings = await this.getRatingById(id, product);
    ratings.rating = rating;
    ratings.userId = userId;
    await ratings.save();
    return ratings;
  }

  stack() {
    function stack() {
      this.count = 0;

      this.storage = {};

      this.push = function (value) {
        this.storage[this.count] = value;

        this.count++;
      };
      this.pop = function () {
        if (this.count === 0) {
          return undefined;
        }

        this.count--;

        var result = this.storage[this.count];

        delete this.storage[this.count];

        return result;
      };

      this.peek = function () {
        return this.storage[this.count - 1];
      };

      this.size = function () {
        return this.count;
      };
    }
  }
}
