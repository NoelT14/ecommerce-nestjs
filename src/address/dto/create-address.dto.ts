import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  Matches,
} from 'class-validator';
import { AddressType } from '../entities/address.entity';

export class CreateAddressDto {
  @IsEnum(AddressType)
  type: AddressType;

  @IsString()
  @MaxLength(200)
  fullName: string;

  @IsString()
  @MaxLength(20)
  @Matches(/^\+?[\d\s\-()]{7,20}$/, { message: 'Invalid phone number' })
  phone: string;

  @IsString()
  @MaxLength(255)
  addressLine1: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  addressLine2?: string;

  @IsString()
  @MaxLength(100)
  city: string;

  @IsString()
  @MaxLength(100)
  country: string;

  @IsString()
  @MaxLength(20)
  postalCode: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
