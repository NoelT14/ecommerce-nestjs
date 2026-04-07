import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { AttributeType } from '../enums/attribute-type.enum';

export class CreateAttributeDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @IsEnum(AttributeType)
  type: AttributeType;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
