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
import { ProductImageService } from './product-image.service';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@ApiTags('Product Images')
@Controller('products/:productId/images')
export class ProductImageController {
  constructor(private readonly service: ProductImageService) {}

  @ApiOperation({ summary: 'Add an image to a product', description: 'Admin only.' })
  @ApiBearerAuth()
  @ApiParam({ name: 'productId', type: String, format: 'uuid' })
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: CreateImageDto,
  ) {
    return this.service.create(productId, dto);
  }

  @ApiOperation({ summary: 'List images of a product' })
  @ApiParam({ name: 'productId', type: String, format: 'uuid' })
  @Get()
  findAll(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.service.findAll(productId);
  }

  @ApiOperation({ summary: 'Update image metadata', description: 'Admin only.' })
  @ApiBearerAuth()
  @ApiParam({ name: 'productId', type: String, format: 'uuid' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateImageDto,
  ) {
    return this.service.update(productId, id, dto);
  }

  @ApiOperation({ summary: 'Delete an image', description: 'Admin only. Hard delete.' })
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
