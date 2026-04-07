import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ProductImage } from './entities/product-image.entity';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';

@Injectable()
export class ProductImageService {
  constructor(
    @InjectRepository(ProductImage)
    private readonly imageRepository: Repository<ProductImage>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
    private readonly dataSource: DataSource,
  ) {}

  async create(productId: string, dto: CreateImageDto): Promise<ProductImage> {
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    if (dto.variantId) {
      const variant = await this.variantRepository.findOne({
        where: { id: dto.variantId, productId },
      });
      if (!variant) throw new NotFoundException('Variant not found on this product');
    }

    if (dto.isCover) {
      return this.dataSource.transaction(async (manager) => {
        await manager.update(ProductImage, { productId }, { isCover: false });
        const image = manager.create(ProductImage, {
          productId,
          variantId: dto.variantId ?? null,
          url: dto.url,
          altText: dto.altText ?? null,
          isCover: true,
          sortOrder: dto.sortOrder ?? 0,
        });
        return manager.save(ProductImage, image);
      });
    }

    const image = this.imageRepository.create({
      productId,
      variantId: dto.variantId ?? null,
      url: dto.url,
      altText: dto.altText ?? null,
      isCover: false,
      sortOrder: dto.sortOrder ?? 0,
    });
    return this.imageRepository.save(image);
  }

  async findAll(productId: string): Promise<ProductImage[]> {
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    return this.imageRepository.find({
      where: { productId },
      order: { isCover: 'DESC', sortOrder: 'ASC' },
    });
  }

  async findOne(productId: string, imageId: string): Promise<ProductImage> {
    const image = await this.imageRepository.findOne({ where: { id: imageId, productId } });
    if (!image) throw new NotFoundException('Image not found');
    return image;
  }

  async update(productId: string, imageId: string, dto: UpdateImageDto): Promise<ProductImage> {
    const image = await this.findOne(productId, imageId);

    if (dto.variantId !== undefined && dto.variantId !== null) {
      const variant = await this.variantRepository.findOne({
        where: { id: dto.variantId, productId },
      });
      if (!variant) throw new NotFoundException('Variant not found on this product');
    }

    if (dto.isCover) {
      return this.dataSource.transaction(async (manager) => {
        await manager.update(ProductImage, { productId }, { isCover: false });
        Object.assign(image, buildImageUpdate(image, dto));
        image.isCover = true;
        return manager.save(ProductImage, image);
      });
    }

    Object.assign(image, buildImageUpdate(image, dto));
    return this.imageRepository.save(image);
  }

  async remove(productId: string, imageId: string): Promise<void> {
    const image = await this.findOne(productId, imageId);
    await this.imageRepository.remove(image);
  }
}

function buildImageUpdate(
  image: ProductImage,
  dto: UpdateImageDto,
): Partial<ProductImage> {
  return {
    url: dto.url ?? image.url,
    altText: dto.altText ?? image.altText,
    isCover: dto.isCover ?? image.isCover,
    sortOrder: dto.sortOrder ?? image.sortOrder,
    variantId: dto.variantId !== undefined ? (dto.variantId ?? null) : image.variantId,
  };
}
