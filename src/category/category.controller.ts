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
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }

  @ApiOperation({ summary: 'Create a category', description: 'Admin only. Optionally nest under a parent by providing parentId.' })
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }

  @ApiOperation({ summary: 'Get full category tree', description: 'Returns all root categories with their nested children.' })
  @Get('tree')
  findTree() {
    return this.categoryService.findTree();
  }

  @ApiOperation({ summary: 'Get a category by ID' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoryService.findOne(id);
  }

  @ApiOperation({ summary: 'Get descendants tree', description: 'Returns the subtree rooted at the given category, including all nested descendants.' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @Get(':id/descendants')
  findDescendants(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoryService.findDescendantsTree(id);
  }

  @ApiOperation({ summary: 'Get ancestors (breadcrumb)', description: 'Returns a flat list from the root down to the given category.' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @Get(':id/ancestors')
  findAncestors(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoryService.findAncestors(id);
  }

  @ApiOperation({ summary: 'Update a category', description: 'Admin only. Pass parentId: null to detach from parent.' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(id, dto);
  }

  @ApiOperation({ summary: 'Soft-delete a category', description: 'Admin only. The record is retained with a deletedAt timestamp.' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoryService.remove(id);
  }
}
