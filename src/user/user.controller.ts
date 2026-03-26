import { Controller, Get, Param, UseGuards, Body, Patch, ForbiddenException } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get('')
  getProfile(@CurrentUser() user: User) {
    return this.userService.toProfileDto(user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() currentUser: User) {
    if (currentUser.id !== id) throw new ForbiddenException();
    const user = await this.userService.findById(id);
    return this.userService.toProfileDto(user);
  }

  //Profile management
  @Patch('profile')
  async updateProfile(@CurrentUser() user: User, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(user.id, dto);
  }
}
