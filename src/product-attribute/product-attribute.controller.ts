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
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { ProductAttributeService } from './product-attribute.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { CreateAttributeValueDto } from './dto/create-attribute-value.dto';
import { UpdateAttributeValueDto } from './dto/update-attribute-value.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

class AttributeQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}

@ApiTags('Attributes')
@Controller('attributes')
export class ProductAttributeController {
  constructor(private readonly service: ProductAttributeService) { }

  @ApiOperation({ summary: 'Create an attribute', description: 'Admin only.' })
  @ApiBearerAuth()
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateAttributeDto) {
    return this.service.create(dto);
  }

  @ApiOperation({ summary: 'List attributes' })
  @Get()
  findAll(@Query() query: AttributeQueryDto) {
    return this.service.findAll(query.page, query.limit);
  }

  @ApiOperation({ summary: 'Get an attribute by ID (includes values)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @ApiOperation({ summary: 'Update an attribute', description: 'Admin only.' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAttributeDto) {
    return this.service.update(id, dto);
  }

  @ApiOperation({ summary: 'Soft-delete an attribute', description: 'Admin only.' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }

  //======Attribute Values=======

  @ApiOperation({ summary: 'Add a value to an attribute', description: 'Admin only.' })
  @ApiBearerAuth()
  @ApiParam({ name: 'attributeId', type: String, format: 'uuid' })
  @Post(':attributeId/values')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  addValue(
    @Param('attributeId', ParseUUIDPipe) attributeId: string,
    @Body() dto: CreateAttributeValueDto,
  ) {
    return this.service.addValue(attributeId, dto);
  }

  @ApiOperation({ summary: 'Update an attribute value', description: 'Admin only.' })
  @ApiBearerAuth()
  @ApiParam({ name: 'attributeId', type: String, format: 'uuid' })
  @ApiParam({ name: 'valueId', type: String, format: 'uuid' })
  @Patch(':attributeId/values/:valueId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateValue(
    @Param('attributeId', ParseUUIDPipe) attributeId: string,
    @Param('valueId', ParseUUIDPipe) valueId: string,
    @Body() dto: UpdateAttributeValueDto,
  ) {
    return this.service.updateValue(attributeId, valueId, dto);
  }

  @ApiOperation({ summary: 'Delete an attribute value', description: 'Admin only.' })
  @ApiBearerAuth()
  @ApiParam({ name: 'attributeId', type: String, format: 'uuid' })
  @ApiParam({ name: 'valueId', type: String, format: 'uuid' })
  @Delete(':attributeId/values/:valueId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeValue(
    @Param('attributeId', ParseUUIDPipe) attributeId: string,
    @Param('valueId', ParseUUIDPipe) valueId: string,
  ) {
    return this.service.removeValue(attributeId, valueId);
  }
}
