import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductVariant } from './entities/product-variant.entity';
import { Product } from './entities/product.entity';
import { AttributeValue } from '../product-attribute/entities/attribute-value.entity';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { StockStatus } from './enums/stock-status.enum';

@Injectable()
export class ProductVariantService {
  constructor(
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(AttributeValue)
    private readonly attributeValueRepository: Repository<AttributeValue>,
  ) {}

  private async resolveAndValidateAttributeValues(ids: string[]): Promise<AttributeValue[]> {
    if (!ids.length) return [];

    const values = await this.attributeValueRepository.findByIds(ids);
    if (values.length !== ids.length) {
      throw new NotFoundException('One or more attribute values not found');
    }

    // Ensure no two values share the same attributeId (e.g. Color=Red AND Color=Blue)
    const attributeIds = values.map((v) => v.attributeId);
    const uniqueAttributeIds = new Set(attributeIds);
    if (uniqueAttributeIds.size !== attributeIds.length) {
      throw new BadRequestException(
        'A variant cannot have two values from the same attribute',
      );
    }

    return values;
  }

  async create(productId: string, dto: CreateVariantDto): Promise<ProductVariant> {
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    const skuConflict = await this.variantRepository.findOne({ where: { sku: dto.sku } });
    if (skuConflict) throw new ConflictException(`SKU "${dto.sku}" is already taken`);

    const attributeValues = await this.resolveAndValidateAttributeValues(
      dto.attributeValueIds ?? [],
    );

    const variant = this.variantRepository.create({
      productId,
      sku: dto.sku,
      price: dto.price !== undefined ? String(dto.price) : null,
      stockQuantity: dto.stockQuantity ?? 0,
      stockStatus: dto.stockStatus ?? StockStatus.IN_STOCK,
      isActive: dto.isActive ?? true,
      sortOrder: dto.sortOrder ?? 0,
      attributeValues,
    });
    return this.variantRepository.save(variant);
  }

  async findAll(productId: string): Promise<ProductVariant[]> {
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    return this.variantRepository.find({
      where: { productId },
      relations: { attributeValues: true, images: true },
      order: { sortOrder: 'ASC' },
    });
  }

  async findOne(productId: string, variantId: string): Promise<ProductVariant> {
    const variant = await this.variantRepository.findOne({
      where: { id: variantId, productId },
      relations: { attributeValues: true, images: true },
    });
    if (!variant) throw new NotFoundException('Variant not found');
    return variant;
  }

  async update(productId: string, variantId: string, dto: UpdateVariantDto): Promise<ProductVariant> {
    const variant = await this.findOne(productId, variantId);

    if (dto.sku && dto.sku !== variant.sku) {
      const conflict = await this.variantRepository.findOne({ where: { sku: dto.sku } });
      if (conflict) throw new ConflictException(`SKU "${dto.sku}" is already taken`);
    }

    if (dto.attributeValueIds !== undefined) {
      variant.attributeValues = await this.resolveAndValidateAttributeValues(dto.attributeValueIds);
    }

    Object.assign(variant, {
      sku: dto.sku ?? variant.sku,
      price: dto.price !== undefined ? String(dto.price) : variant.price,
      stockQuantity: dto.stockQuantity ?? variant.stockQuantity,
      stockStatus: dto.stockStatus ?? variant.stockStatus,
      isActive: dto.isActive ?? variant.isActive,
      sortOrder: dto.sortOrder ?? variant.sortOrder,
    });
    return this.variantRepository.save(variant);
  }

  async remove(productId: string, variantId: string): Promise<void> {
    const variant = await this.findOne(productId, variantId);
    await this.variantRepository.softRemove(variant);
  }
}
