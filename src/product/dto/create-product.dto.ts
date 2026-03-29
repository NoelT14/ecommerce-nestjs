import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductStatus } from '../enums/product-status.enum';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stockQuantity?: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  sku: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
