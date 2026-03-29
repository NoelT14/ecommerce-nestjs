import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Category } from '../category/entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
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
    private readonly categoryRepository: Repository<Category>
  ) { }

  async create(createDto: CreateProductDto): Promise<Product> {

    const slug = createDto.slug ?? toSlug(createDto.name);

    const [slugExists, skuExists] = await Promise.all([
      this.productRepository.findOne({ where: { slug } }),
      this.productRepository.findOne({ where: { sku: createDto.sku } })
    ])

    if (slugExists) throw new ConflictException(`Slug "${slug}" is already taken`);
    if (skuExists) throw new ConflictException(`SKU "${createDto.sku}" is already taken`);

    if (createDto.categoryId) {
      const category = await this.categoryRepository.findOne(
        { where: { id: createDto.categoryId } })
      if (!category) throw new NotFoundException('Category not found');
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
    });

    return this.productRepository.save(product);

  }

  async findOne(idOrSlug: string): Promise<Product> {
    const isUuid = /^[0-9a-f-]{36}$/.test(idOrSlug);
    const product = await this.productRepository.findOne({
      where: isUuid ? { id: idOrSlug } : { slug: idOrSlug },
      relations: { category: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }



  async findAll(query: ProductQueryDto)
    : Promise<{ data: Product[]; meta: Record<string, number> }> {
    const { page, limit, search, categoryId, status } = query;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    if (search) where.name = ILike(`%${escapeLike(search)}%`);

    const [data, total] = await this.productRepository.findAndCount({
      where,
      relations: { category: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

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
        //if null dergohet me qellim,produkti hiqet nga kategoria
        product.categoryId = null;
      } else {

        const category = await this.productRepository.findOne({ where: { id: dto.categoryId } });
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
    });

    return this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.softRemove(product);
  }
}
