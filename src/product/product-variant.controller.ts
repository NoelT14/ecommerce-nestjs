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
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ProductVariantService } from './product-variant.service';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@ApiTags('Product Variants')
@Controller('products/:productId/variants')
export class ProductVariantController {
  constructor(private readonly service: ProductVariantService) {}

  @ApiOperation({ summary: 'Create a variant for a product', description: 'Admin only.' })
  @ApiBearerAuth()
  @ApiParam({ name: 'productId', type: String, format: 'uuid' })
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: CreateVariantDto,
  ) {
    return this.service.create(productId, dto);
  }

  @ApiOperation({ summary: 'List variants of a product' })
  @ApiParam({ name: 'productId', type: String, format: 'uuid' })
  @Get()
  findAll(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.service.findAll(productId);
  }

  @ApiOperation({ summary: 'Get a single variant' })
  @ApiParam({ name: 'productId', type: String, format: 'uuid' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @Get(':id')
  findOne(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.findOne(productId, id);
  }

  @ApiOperation({ summary: 'Update a variant', description: 'Admin only.' })
  @ApiBearerAuth()
  @ApiParam({ name: 'productId', type: String, format: 'uuid' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVariantDto,
  ) {
    return this.service.update(productId, id, dto);
  }

  @ApiOperation({ summary: 'Soft-delete a variant', description: 'Admin only.' })
  @ApiBearerAuth()
  @ApiParam({ name: 'productId', type: String, format: 'uuid' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.remove(productId, id);
  }
}
