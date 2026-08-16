import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { TaskStatus } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // ?projectId=&status=&priority= — used by both board and list views,
  // and by the search box (frontend filters client-side on the result)
  @Get()
  findAll(
    @CurrentUser() user: { userId: string },
    @Query('projectId') projectId?: string,
    @Query('status') status?: TaskStatus,
    @Query('priority') priority?: string,
  ) {
    return this.tasksService.findAll(user.userId, { projectId, status, priority });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateTaskDto, @CurrentUser() user: { userId: string }) {
    return this.tasksService.create(dto, user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.tasksService.update(id, dto, user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }

  @Post(':id/subtasks')
  addSubtask(@Param('id') id: string, @Body() dto: CreateSubtaskDto) {
    return this.tasksService.addSubtask(id, dto);
  }

  @Post(':id/comments')
  addComment(
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.tasksService.addComment(id, dto, user.userId);
  }
}