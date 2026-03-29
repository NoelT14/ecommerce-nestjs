import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, TreeRepository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { toSlug } from 'src/product/product.service';


@Injectable()
export class CategoryService {
  private readonly treeRepo: TreeRepository<Category>;

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Category) private readonly categoryRepository: Repository<Category>,
  ) {
    this.treeRepo = this.dataSource.getTreeRepository(Category);
  }

  /**
   * Creates a new category.
   * Auto-generates a slug from the name if not provided.
   * Enforces slug uniqueness and validates the parent category if parentId is given.
   */
  async create(dto: CreateCategoryDto): Promise<Category> {
    const slug = dto.slug ?? toSlug(dto.name);

    const existing = await this.categoryRepository.findOne({ where: { slug } });
    if (existing) throw new ConflictException(`Slug "${slug}" is already taken`);

    const category = this.categoryRepository.create({
      name: dto.name,
      slug,
      description: dto.description ?? null,
      imageUrl: dto.imageUrl ?? null,
      sortOrder: dto.sortOrder ?? 0,
      isActive: dto.isActive ?? true,
    });

    if (dto.parentId) {
      const parent = await this.categoryRepository.findOne({ where: { id: dto.parentId } });
      if (!parent) throw new NotFoundException('Parent category not found');
      category.parent = parent;
    }

    return this.categoryRepository.save(category);
  }

  /**
   * Returns the full category tree from all root nodes down to their leaves.
   * Each node includes its nested children via the `children` relation.
   */
  async findTree(): Promise<Category[]> {
    const tree = await this.treeRepo.findTrees({ relations: ['children'] });
    return tree;
  }

  /**
   * Finds a single category by its UUID.
   * Throws NotFoundException if no category with the given ID exists.
   */
  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  /**
   * Returns a subtree rooted at the given category, including all nested descendants.
   * Useful for rendering a category branch in isolation.
   */
  async findDescendantsTree(id: string): Promise<Category> {
    const category = await this.findOne(id);
    return this.treeRepo.findDescendantsTree(category);
  }

  /**
   * Returns the flat list of ancestor categories from the root down to the given category.
   * Useful for rendering breadcrumb navigation.
   */
  async findAncestors(id: string): Promise<Category[]> {
    const category = await this.findOne(id);
    return this.treeRepo.findAncestors(category);
  }

  /**
   * Updates an existing category by ID.
   * Validates slug uniqueness on change, prevents self-parenting,
   * and allows detaching from a parent by passing parentId: null.
   */
  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);

    if (dto.slug && dto.slug !== category.slug) {
      const conflict = await this.categoryRepository.findOne({ where: { slug: dto.slug } });
      if (conflict) throw new ConflictException(`Slug "${dto.slug}" is already taken`);
    }

    if (dto.parentId !== undefined) {
      if (dto.parentId === null) {
        category.parent = null;
      } else {
        if (dto.parentId === id) throw new ConflictException('Category cannot be its own parent');
        const parent = await this.categoryRepository.findOne({ where: { id: dto.parentId } });
        if (!parent) throw new NotFoundException('Parent category not found');
        category.parent = parent;
      }
    }

    Object.assign(category, {
      name: dto.name ?? category.name,
      slug: dto.slug ?? category.slug,
      description: dto.description ?? category.description,
      imageUrl: dto.imageUrl ?? category.imageUrl,
      sortOrder: dto.sortOrder ?? category.sortOrder,
      isActive: dto.isActive ?? category.isActive,
    });

    return this.categoryRepository.save(category);
  }

  /**
   * Soft deletes a category by ID.
   * The record is retained in the database with a deletedAt
   */
  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);
    await this.categoryRepository.softRemove(category);
  }
}
