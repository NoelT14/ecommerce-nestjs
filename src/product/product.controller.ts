import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @ApiOperation({ summary: 'Create a product', description: 'Admin only.' })
  @ApiBearerAuth()
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateProductDto) {
    return this.productService.create(dto);
  }

  @ApiOperation({ summary: 'List products', description: 'Supports pagination, full-text search, category filter, and status filter.' })
  @Get()
  findAll(@Query() query: ProductQueryDto) {
    return this.productService.findAll(query);
  }

  @ApiOperation({ summary: 'Get a product by UUID or slug' })
  @ApiParam({ name: 'idOrSlug', type: String, description: 'Product UUID or slug' })
  @Get(':idOrSlug')
  findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.productService.findOne(idOrSlug);
  }

  @ApiOperation({ summary: 'Update a product', description: 'Admin only.' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productService.update(id, dto);
  }

  @ApiOperation({ summary: 'Soft-delete a product', description: 'Admin only. The record is retained with a deletedAt timestamp.' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.remove(id);
  }
}
