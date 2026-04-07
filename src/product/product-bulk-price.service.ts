import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductBulkPrice } from './entities/product-bulk-price.entity';
import { Product } from './entities/product.entity';
import { CreateBulkPriceDto } from './dto/create-bulk-price.dto';
import { UpdateBulkPriceDto } from './dto/update-bulk-price.dto';

@Injectable()
export class ProductBulkPriceService {
  constructor(
    @InjectRepository(ProductBulkPrice)
    private readonly bulkPriceRepository: Repository<ProductBulkPrice>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(productId: string, dto: CreateBulkPriceDto): Promise<ProductBulkPrice> {
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    const regularPrice = parseFloat(product.price);
    if (dto.price >= regularPrice) {
      throw new BadRequestException(
        'Bulk price must be lower than the product regular price',
      );
    }

    const conflict = await this.bulkPriceRepository.findOne({
      where: { productId, minQuantity: dto.minQuantity },
    });
    if (conflict) {
      throw new ConflictException(
        `A bulk price tier for quantity ${dto.minQuantity} already exists`,
      );
    }

    const tier = this.bulkPriceRepository.create({
      productId,
      minQuantity: dto.minQuantity,
      price: String(dto.price),
    });
    return this.bulkPriceRepository.save(tier);
  }

  async findAll(productId: string): Promise<ProductBulkPrice[]> {
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    return this.bulkPriceRepository.find({
      where: { productId },
      order: { minQuantity: 'ASC' },
    });
  }

  async findOne(productId: string, bulkPriceId: string): Promise<ProductBulkPrice> {
    const tier = await this.bulkPriceRepository.findOne({
      where: { id: bulkPriceId, productId },
    });
    if (!tier) throw new NotFoundException('Bulk price tier not found');
    return tier;
  }

  async update(
    productId: string,
    bulkPriceId: string,
    dto: UpdateBulkPriceDto,
  ): Promise<ProductBulkPrice> {
    const tier = await this.findOne(productId, bulkPriceId);

    if (dto.minQuantity !== undefined && dto.minQuantity !== tier.minQuantity) {
      const conflict = await this.bulkPriceRepository.findOne({
        where: { productId, minQuantity: dto.minQuantity },
      });
      if (conflict) {
        throw new ConflictException(
          `A bulk price tier for quantity ${dto.minQuantity} already exists`,
        );
      }
    }

    if (dto.price !== undefined) {
      const product = await this.productRepository.findOne({ where: { id: productId } });
      if (dto.price >= parseFloat(product!.price)) {
        throw new BadRequestException(
          'Bulk price must be lower than the product regular price',
        );
      }
    }

    Object.assign(tier, {
      minQuantity: dto.minQuantity ?? tier.minQuantity,
      price: dto.price !== undefined ? String(dto.price) : tier.price,
    });
    return this.bulkPriceRepository.save(tier);
  }

  async remove(productId: string, bulkPriceId: string): Promise<void> {
    const tier = await this.findOne(productId, bulkPriceId);
    await this.bulkPriceRepository.remove(tier);
  }
}
