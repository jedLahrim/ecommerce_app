import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class GetProductsPaginationDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  search: string;

  @IsOptional()
  // @IsNumber()
  // @Min(1)
  page: number;

  @IsOptional()
  // @IsNumber()
  // @Min(1)
  // @Max(100)
  pageSize: number;
}
