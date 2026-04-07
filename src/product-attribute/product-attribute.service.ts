import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductAttribute } from './entities/product-attribute.entity';
import { AttributeValue } from './entities/attribute-value.entity';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { CreateAttributeValueDto } from './dto/create-attribute-value.dto';
import { UpdateAttributeValueDto } from './dto/update-attribute-value.dto';


export class ProductAttributeService {

  constructor(
    @InjectRepository(ProductAttribute)
    private readonly productAttributeRepository: Repository<ProductAttribute>,
    @InjectRepository(AttributeValue)
    private readonly attributeValueRepository: Repository<AttributeValue>,
  ) { }

  async create(createDto: CreateAttributeDto): Promise<ProductAttribute> {

    const exists = await this.productAttributeRepository.findOne({
      where: { name: createDto.name }
    })
    if (exists) throw new ConflictException(`Attribute "${createDto.name}" already exists`);

    const attribute = await this.productAttributeRepository.create({
      name: createDto.name,
      type: createDto.type,
      isActive: createDto.isActive ?? true,
    })

    return this.productAttributeRepository.save(attribute);

  }

  async findAll(page: number, limit: number): Promise<{ data: ProductAttribute[]; meta: Record<string, number> }> {
    const [data, total] = await this.productAttributeRepository.findAndCount({
      relations: { values: true },
      order: { name: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string): Promise<ProductAttribute> {
    const productAttribute = await this.productAttributeRepository.findOne({
      where: { id }, relations: { values: true }
    })
    if (!productAttribute) throw new NotFoundException(`Product Attribute Not Found`);
    return productAttribute;
  }

  async update(id: string, dto: UpdateAttributeDto): Promise<ProductAttribute> {
    const attribute = await this.findOne(id);

    if (dto.name && dto.name !== attribute.name) {
      const conflict = await this.productAttributeRepository.findOne({ where: { name: dto.name } });
      if (conflict) throw new ConflictException(`Attribute "${dto.name}" already exists`);
    }

    Object.assign(attribute, {
      name: dto.name ?? attribute.name,
      type: dto.type ?? attribute.type,
      isActive: dto.isActive ?? attribute.isActive,
    });
    return this.productAttributeRepository.save(attribute);
  }

  async remove(id: string): Promise<void> {
    const attribute = await this.findOne(id);
    await this.productAttributeRepository.softRemove(attribute);
  }


  async addValue(attributeId: string, dto: CreateAttributeValueDto): Promise<AttributeValue> {
    await this.findOne(attributeId);

    const exists = await this.attributeValueRepository.findOne({
      where: { attributeId, value: dto.value },
    });
    if (exists) throw new ConflictException(`Value "${dto.value}" already exists in this attribute`);

    const val = this.attributeValueRepository.create({
      attributeId,
      value: dto.value,
      sortOrder: dto.sortOrder ?? 0,
    });
    return this.attributeValueRepository.save(val);
  }

  async updateValue(attributeId: string, valueId: string,
    dto: UpdateAttributeValueDto): Promise<AttributeValue> {
    const val = await this.attributeValueRepository.findOne({ where: { id: valueId, attributeId } });
    if (!val) throw new NotFoundException('Attribute value not found');

    if (dto.value && dto.value !== val.value) {
      const conflict = await this.attributeValueRepository.findOne({
        where: { attributeId, value: dto.value },
      });
      if (conflict) throw new ConflictException(`Value "${dto.value}" already exists in this attribute`);
    }

    Object.assign(val, {
      value: dto.value ?? val.value,
      sortOrder: dto.sortOrder ?? val.sortOrder,
    });
    return this.attributeValueRepository.save(val);
  }

  async removeValue(attributeId: string, valueId: string): Promise<void> {
    const val = await this.attributeValueRepository.findOne({ where: { id: valueId, attributeId } });
    if (!val) throw new NotFoundException('Attribute value not found');
    await this.attributeValueRepository.remove(val);
  }

}
