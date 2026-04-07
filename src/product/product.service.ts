import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Category } from '../category/entities/category.entity';
import { Tag } from '../product-tag/entities/tag.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { SetProductTagsDto } from './dto/set-product-tags.dto';
import { ProductStatus } from './enums/product-status.enum';

export function toSlug(text: string): string {
  return text.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&');
}

@Injectable()
export class ProductService {

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  async create(createDto: CreateProductDto): Promise<Product> {
    const slug = createDto.slug ?? toSlug(createDto.name);

    const [slugExists, skuExists] = await Promise.all([
      this.productRepository.findOne({ where: { slug } }),
      this.productRepository.findOne({ where: { sku: createDto.sku } }),
    ]);

    if (slugExists) throw new ConflictException(`Slug "${slug}" is already taken`);
    if (skuExists) throw new ConflictException(`SKU "${createDto.sku}" is already taken`);

    if (createDto.categoryId) {
      const category = await this.categoryRepository.findOne(
        { where: { id: createDto.categoryId } });
      if (!category) throw new NotFoundException('Category not found');
    }

    let tags: Tag[] = [];
    if (createDto.tagIds?.length) {
      tags = await this.tagRepository.find({ where: { id: In(createDto.tagIds) } });
      if (tags.length !== createDto.tagIds.length) {
        throw new NotFoundException('One or more tags not found');
      }
    }

    const product = this.productRepository.create({
      name: createDto.name,
      slug,
      description: createDto.description ?? null,
      price: String(createDto.price),
      stockQuantity: createDto.stockQuantity ?? 0,
      sku: createDto.sku,
      imageUrl: createDto.imageUrl ?? null,
      status: createDto.status ?? ProductStatus.DRAFT,
      isActive: createDto.isActive ?? true,
      categoryId: createDto.categoryId ?? null,
      stockStatus: createDto.stockStatus,
      salePrice: createDto.salePrice !== undefined ? String(createDto.salePrice) : null,
      saleStartsAt: createDto.saleStartsAt ?? null,
      saleEndsAt: createDto.saleEndsAt ?? null,
      tags,
    });

    return this.productRepository.save(product);
  }

  async findOne(idOrSlug: string): Promise<Product> {
    const isUuid = /^[0-9a-f-]{36}$/.test(idOrSlug);
    const product = await this.productRepository.findOne({
      where: isUuid ? { id: idOrSlug } : { slug: idOrSlug },
      relations: {
        category: true,
        tags: true,
        images: true,
        videos: true,
        bulkPrices: true,
        variants: { attributeValues: { attribute: true }, images: true },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findAll(query: ProductQueryDto)
    : Promise<{ data: Product[]; meta: Record<string, number> }> {
    const { page, limit, search, categoryId, status, stockStatus, tagId } = query;

    const qb = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .orderBy('product.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (status) qb.andWhere('product.status = :status', { status });
    if (categoryId) qb.andWhere('product.categoryId = :categoryId', { categoryId });
    if (stockStatus) qb.andWhere('product.stockStatus = :stockStatus', { stockStatus });
    if (search) qb.andWhere('product.name ILIKE :search', { search: `%${escapeLike(search)}%` });
    if (tagId) {
      qb.innerJoin('product.tags', 'tag', 'tag.id = :tagId', { tagId });
    }

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    if (dto.slug && dto.slug !== product.slug) {
      const conflict = await this.productRepository.findOne({ where: { slug: dto.slug } });
      if (conflict) throw new ConflictException(`Slug "${dto.slug}" is already taken`);
    }

    if (dto.sku && dto.sku !== product.sku) {
      const conflict = await this.productRepository.findOne({ where: { sku: dto.sku } });
      if (conflict) throw new ConflictException(`SKU "${dto.sku}" is already taken`);
    }

    if (dto.categoryId !== undefined) {
      if (dto.categoryId === null) {
        product.categoryId = null;
      } else {
        const category = await this.categoryRepository.findOne({ where: { id: dto.categoryId } });
        if (!category) throw new NotFoundException('Category not found');
        product.categoryId = dto.categoryId;
      }
    }

    Object.assign(product, {
      name: dto.name ?? product.name,
      slug: dto.slug ?? product.slug,
      description: dto.description ?? product.description,
      price: dto.price !== undefined ? String(dto.price) : product.price,
      stockQuantity: dto.stockQuantity ?? product.stockQuantity,
      sku: dto.sku ?? product.sku,
      imageUrl: dto.imageUrl ?? product.imageUrl,
      status: dto.status ?? product.status,
      isActive: dto.isActive ?? product.isActive,
      stockStatus: dto.stockStatus ?? product.stockStatus,
      salePrice: dto.salePrice !== undefined ? String(dto.salePrice) : product.salePrice,
      saleStartsAt: dto.saleStartsAt ?? product.saleStartsAt,
      saleEndsAt: dto.saleEndsAt ?? product.saleEndsAt,
    });

    return this.productRepository.save(product);
  }

  async setTags(id: string, dto: SetProductTagsDto): Promise<Product> {
    const product = await this.findOne(id);

    if (dto.tagIds.length) {
      const tags = await this.tagRepository.find({ where: { id: In(dto.tagIds) } });
      if (tags.length !== dto.tagIds.length) {
        throw new NotFoundException('One or more tags not found');
      }
      product.tags = tags;
    } else {
      product.tags = [];
    }

    return this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.softRemove(product);
  }
}
