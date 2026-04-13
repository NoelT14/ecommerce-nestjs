import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagQueryDto } from './dto/tag-query.dto';
import { toSlug } from '../product/product.service';

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&');
}

@Injectable()
export class ProductTagService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) { }

  async create(dto: CreateTagDto): Promise<Tag> {
    const slug = dto.slug ?? toSlug(dto.name);

    const [nameConflict, slugConflict] = await Promise.all([
      this.tagRepository.findOne({ where: { name: dto.name } }),
      this.tagRepository.findOne({ where: { slug } }),
    ]);
    if (nameConflict) throw new ConflictException(`Tag "${dto.name}" already exists`);
    if (slugConflict) throw new ConflictException(`Slug "${slug}" is already taken`);

    const tag = this.tagRepository.create({
      name: dto.name,
      slug,
      isActive: dto.isActive ?? true,
    });
    return this.tagRepository.save(tag);
  }

  async findAll(query: TagQueryDto): Promise<{ data: Tag[]; meta: Record<string, number> }> {
    const { page, limit, search } = query;
    const where = search ? { name: ILike(`%${escapeLike(search)}%`) } : {};

    const [data, total] = await this.tagRepository.findAndCount({
      where,
      order: { name: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(idOrSlug: string): Promise<Tag> {
    const isUuid = /^[0-9a-f-]{36}$/.test(idOrSlug);
    const tag = await this.tagRepository.findOne({
      where: isUuid ? { id: idOrSlug } : { slug: idOrSlug },
    });
    if (!tag) throw new NotFoundException('Tag not found');
    return tag;
  }

  async update(id: string, dto: UpdateTagDto): Promise<Tag> {
    const tag = await this.findOne(id);

    if (dto.name && dto.name !== tag.name) {
      const conflict = await this.tagRepository.findOne({ where: { name: dto.name } });
      if (conflict) throw new ConflictException(`Tag "${dto.name}" already exists`);
    }

    if (dto.slug && dto.slug !== tag.slug) {
      const conflict = await this.tagRepository.findOne({ where: { slug: dto.slug } });
      if (conflict) throw new ConflictException(`Slug "${dto.slug}" is already taken`);
    }

    Object.assign(tag, {
      name: dto.name ?? tag.name,
      // Slug is only updated when explicitly provided - never auto-regenerated on update
      slug: dto.slug ?? tag.slug,
      isActive: dto.isActive ?? tag.isActive,
    });
    return this.tagRepository.save(tag);
  }

  async remove(id: string): Promise<void> {
    const tag = await this.findOne(id);
    await this.tagRepository.softRemove(tag);
  }
}
