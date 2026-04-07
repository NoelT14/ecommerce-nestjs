import { PartialType } from '@nestjs/mapped-types';
import { CreateBulkPriceDto } from './create-bulk-price.dto';

export class UpdateBulkPriceDto extends PartialType(CreateBulkPriceDto) {}
