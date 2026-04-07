import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from './entities/tag.entity';
import { ProductTagService } from './product-tag.service';
import { ProductTagController } from './product-tag.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Tag])],
  controllers: [ProductTagController],
  providers: [ProductTagService],
  exports: [ProductTagService],
})
export class ProductTagModule {}
