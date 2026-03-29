import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductView } from './entities/product-view.entity';
import { Product } from '../product/entities/product.entity';

@Injectable()
export class RecentlyViewedService {
  constructor(
    @InjectRepository(ProductView)
    private readonly viewRepository: Repository<ProductView>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>
  ) { }

  async recordView(userId: string, productId: string): Promise<void> {
    const product = await this.productRepository.findOne({
      where: { id: productId, isActive: true },
    });
    if (!product) throw new NotFoundException('Product not found');

    //If no conflict : insert row
    //If conflict(unique constraint) : update specified columns
    await this.viewRepository.createQueryBuilder().insert().into(ProductView)
      .values({ userId, productId, viewedAt: new Date() })
      .orUpdate(['viewed_at'], ['user_id', 'product_id'])
      .execute();
  }

  async getRecentViews(userId: string, limit: number = 10): Promise<ProductView[]> {
    return this.viewRepository.find({
      where: { userId },
      relations: { product: true },
      order: { viewedAt: 'DESC' },
      take: limit,
    });
  }

  async clearHistory(userId: string): Promise<void> {
    await this.viewRepository.delete({ userId });
  }

  async removeOne(userId: string, productId: string): Promise<void> {
    const view = await this.viewRepository.findOne({ where: { userId, productId } });
    if (!view) throw new NotFoundException('Product not found in history');
    await this.viewRepository.remove(view);
  }
}
