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
import { ProductBulkPriceService } from './product-bulk-price.service';
import { CreateBulkPriceDto } from './dto/create-bulk-price.dto';
import { UpdateBulkPriceDto } from './dto/update-bulk-price.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@ApiTags('Product Bulk Prices')
@Controller('products/:productId/bulk-prices')
export class ProductBulkPriceController {
  constructor(private readonly service: ProductBulkPriceService) {}

  @ApiOperation({ summary: 'Add a bulk price tier to a product', description: 'Admin only.' })
  @ApiBearerAuth()
  @ApiParam({ name: 'productId', type: String, format: 'uuid' })
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: CreateBulkPriceDto,
  ) {
    return this.service.create(productId, dto);
  }

  @ApiOperation({ summary: 'List bulk price tiers of a product (ordered by min quantity)' })
  @ApiParam({ name: 'productId', type: String, format: 'uuid' })
  @Get()
  findAll(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.service.findAll(productId);
  }

  @ApiOperation({ summary: 'Update a bulk price tier', description: 'Admin only.' })
  @ApiBearerAuth()
  @ApiParam({ name: 'productId', type: String, format: 'uuid' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBulkPriceDto,
  ) {
    return this.service.update(productId, id, dto);
  }

  @ApiOperation({ summary: 'Delete a bulk price tier', description: 'Admin only.' })
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
