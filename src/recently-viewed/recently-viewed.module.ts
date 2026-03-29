import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecentlyViewedService } from './recently-viewed.service';
import { RecentlyViewedController } from './recently-viewed.controller';
import { ProductView } from './entities/product-view.entity';
import { Product } from '../product/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductView, Product])],
  controllers: [RecentlyViewedController],
  providers: [RecentlyViewedService],
  exports: [RecentlyViewedService],
})
export class RecentlyViewedModule {}
