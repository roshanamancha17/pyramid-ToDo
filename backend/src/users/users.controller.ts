import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Member picker lists on task/subtask assignment
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  me(@CurrentUser() user: { userId: string }) {
    return this.usersService.findById(user.userId);
  }

  // Profile / Theme / Color settings screens
  @Patch('me')
  updateMe(@CurrentUser() user: { userId: string }, @Body() dto: UpdateUserDto) {
    return this.usersService.update(user.userId, dto);
  }

  @Delete('me')
  leaveWorkspace(@CurrentUser() user: { userId: string }) {
    return this.usersService.remove(user.userId);
  }
}
