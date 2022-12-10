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
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateRatingDto } from './dto/create-rating.dto';
import { GetProduct } from '../product/decorator/get-product.decorator';
import { GetRatingsFilterDto } from './dto/get-rating.dto';
import { Rating } from './entity/rating.entity';
import { Product } from '../product/entity/product.entity';
import { RatingService } from './rating.service';

@Controller('rating')
@UseGuards(AuthGuard('jwt'))
export class RatingController {
  private logger = new Logger('RatingsController');

  constructor(private ratingsService: RatingService) {}

  @Get()
  getRatings(
    @Query(ValidationPipe) filterDto: GetRatingsFilterDto,
    @GetProduct() product: Product,
  ): Promise<Rating[]> {
    return this.ratingsService.getRatings(filterDto, product);
  }

  @Get('/:id')
  getRatingById(
    @Param('id', ParseIntPipe) id: number,
    @GetProduct() product: Product,
  ): Promise<Rating> {
    return this.ratingsService.getRatingById(id, product);
  }

  @Post()
  @UsePipes(ValidationPipe)
  createRating(
    @Body() createRatingOrderDto: CreateRatingDto,
    @GetProduct() product: Product,
  ): Promise<Rating> {
    return this.ratingsService.createRating(createRatingOrderDto, product);
  }

  @Patch('/:id')
  updateRatingStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() createRatingDto: CreateRatingDto,
    @GetProduct() product: Product,
  ): Promise<Rating> {
    return this.ratingsService.updateRating(id, createRatingDto, product);
  }
}
