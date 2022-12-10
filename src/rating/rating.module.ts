import {TypeOrmModule} from '@nestjs/typeorm';
import {AuthModule} from '../auth/auth.module';
import {Module} from '@nestjs/common';
import { RatingController } from "./rating.controller";
import { RatingService } from "./rating.service";
import { Rating } from "./entity/rating.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Rating]),
    AuthModule,
  ],
  controllers: [RatingController],
  providers: [RatingService],
})
export class RatingModule {}
