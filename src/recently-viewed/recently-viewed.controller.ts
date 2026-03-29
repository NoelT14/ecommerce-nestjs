import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RecentlyViewedService } from './recently-viewed.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../user/entities/user.entity';

@Controller('users/recently-viewed')
@UseGuards(JwtAuthGuard)
export class RecentlyViewedController {
  constructor(private readonly recentlyViewedService: RecentlyViewedService) { }

  /**
   * Record a product view. Called  whenever a user visits a product page.
   */
  @Post(':productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  recordView(
    @CurrentUser() user: User,
    @Param('productId', ParseUUIDPipe) productId: string
  ) {
    return this.recentlyViewedService.recordView(user.id, productId);
  }

  /**
   * Get the authenticated user's recently viewed products.
   */
  @Get()
  getRecentViews(
    @CurrentUser() user: User,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10
  ) {
    return this.recentlyViewedService.getRecentViews(user.id, Math.min(limit, 50))
  }

  /**
   * Remove a single product from history.
   */
  @Delete(':productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeOne(
    @CurrentUser() user: User,
    @Param('productId', new ParseUUIDPipe()) productId: string
  ) {
    return this.recentlyViewedService.removeOne(user.id, productId)
  }

  /**
   * Clear the entire view history for the authenticated user.
   */
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  clearHistory(@CurrentUser() user: User) {
    return this.recentlyViewedService.clearHistory(user.id);
  }

}
