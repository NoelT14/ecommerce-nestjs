import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WishlistItem } from './entities/wishlist-item.entity';
import { Product } from '../product/entities/product.entity';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';
import { WishlistQueryDto } from './dto/wishlist-query.dto';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(WishlistItem)
    private readonly wishlistRepo: Repository<WishlistItem>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async add(userId: string, dto: AddToWishlistDto): Promise<WishlistItem> {
    const product = await this.productRepo.findOne({
      where: { id: dto.productId, isActive: true },
    });
    if (!product) throw new NotFoundException('Product not found');

    const existing = await this.wishlistRepo.findOne({
      where: { userId, productId: dto.productId },
    });
    if (existing) throw new ConflictException('Product already in wishlist');

    const item = this.wishlistRepo.create({ userId, productId: dto.productId });
    return this.wishlistRepo.save(item);
  }

  async remove(userId: string, productId: string): Promise<void> {
    const item = await this.wishlistRepo.findOne({
      where: { userId, productId },
    });
    if (!item) throw new NotFoundException('Product not found in wishlist');
    await this.wishlistRepo.remove(item);
  }

  async findAll(
    userId: string,
    query: WishlistQueryDto,
  ): Promise<{ data: WishlistItem[]; meta: Record<string, number> }> {
    const { page, limit } = query;
    const [data, total] = await this.wishlistRepo.findAndCount({
      where: { userId },
      relations: { product: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
