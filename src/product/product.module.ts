import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ProductVariantService } from './product-variant.service';
import { ProductVariantController } from './product-variant.controller';
import { ProductImageService } from './product-image.service';
import { ProductImageController } from './product-image.controller';
import { ProductVideoService } from './product-video.service';
import { ProductVideoController } from './product-video.controller';
import { ProductBulkPriceService } from './product-bulk-price.service';
import { ProductBulkPriceController } from './product-bulk-price.controller';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductVideo } from './entities/product-video.entity';
import { ProductBulkPrice } from './entities/product-bulk-price.entity';
import { Category } from '../category/entities/category.entity';
import { Tag } from '../product-tag/entities/tag.entity';
import { AttributeValue } from '../product-attribute/entities/attribute-value.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductVariant,
      ProductImage,
      ProductVideo,
      ProductBulkPrice,
      Category,
      Tag,
      AttributeValue,
    ]),
  ],
  controllers: [
    ProductController,
    ProductVariantController,
    ProductImageController,
    ProductVideoController,
    ProductBulkPriceController,
  ],
  providers: [
    ProductService,
    ProductVariantService,
    ProductImageService,
    ProductVideoService,
    ProductBulkPriceService,
  ],
  exports: [ProductService],
})
export class ProductModule {}
