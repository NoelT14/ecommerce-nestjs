import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductVideo } from './entities/product-video.entity';
import { Product } from './entities/product.entity';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';

@Injectable()
export class ProductVideoService {
  constructor(
    @InjectRepository(ProductVideo)
    private readonly videoRepository: Repository<ProductVideo>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(productId: string, dto: CreateVideoDto): Promise<ProductVideo> {
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    const video = this.videoRepository.create({
      productId,
      url: dto.url,
      title: dto.title ?? null,
      sortOrder: dto.sortOrder ?? 0,
    });
    return this.videoRepository.save(video);
  }

  async findAll(productId: string): Promise<ProductVideo[]> {
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    return this.videoRepository.find({
      where: { productId },
      order: { sortOrder: 'ASC' },
    });
  }

  async findOne(productId: string, videoId: string): Promise<ProductVideo> {
    const video = await this.videoRepository.findOne({ where: { id: videoId, productId } });
    if (!video) throw new NotFoundException('Video not found');
    return video;
  }

  async update(productId: string, videoId: string, dto: UpdateVideoDto): Promise<ProductVideo> {
    const video = await this.findOne(productId, videoId);
    Object.assign(video, {
      url: dto.url ?? video.url,
      title: dto.title ?? video.title,
      sortOrder: dto.sortOrder ?? video.sortOrder,
    });
    return this.videoRepository.save(video);
  }

  async remove(productId: string, videoId: string): Promise<void> {
    const video = await this.findOne(productId, videoId);
    await this.videoRepository.remove(video);
  }
}
