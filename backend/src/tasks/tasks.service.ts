import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { TaskStatus } from '@prisma/client';

const TASK_INCLUDE = {
  members: { include: { user: true } },
  labels: { include: { label: true } },
  reporter: true,
  project: true,
  subtasks: { include: { members: { include: { user: true } } } },
};

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  // Powers both the Board view (grouped by column) and List view
  // (grouped accordions: To Do / Doing / Completed / On Hold) —
  // the frontend just groups this flat list by `status`.
  //
  // Scoped to the current user: visible if they created the task
  // (reporter) or are assigned to it (member). This keeps each
  // guest/user's dashboard private rather than one shared global list,
  // while still letting assigned collaborators see shared tasks.
  async findAll(
    userId: string,
    filters: { projectId?: string; status?: TaskStatus; priority?: string },
  ) {
    return this.prisma.task.findMany({
      where: {
        AND: [
          { OR: [{ reporterId: userId }, { members: { some: { userId } } }] },
          { projectId: filters.projectId },
          { status: filters.status },
          { priority: filters.priority as never },
        ],
      },
      include: TASK_INCLUDE,
      orderBy: [{ status: 'asc' }, { position: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        ...TASK_INCLUDE,
        comments: { include: { author: true }, orderBy: { createdAt: 'asc' } },
        activityLogs: { include: { user: true }, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async create(dto: CreateTaskDto, reporterId: string) {
    const { memberIds, labelIds, dueDate, ...rest } = dto;
    return this.prisma.task.create({
      data: {
        ...rest,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        reporterId,
        members: memberIds
          ? { create: memberIds.map((userId) => ({ userId })) }
          : undefined,
        labels: labelIds
          ? { create: labelIds.map((labelId) => ({ labelId })) }
          : undefined,
      },
      include: TASK_INCLUDE,
    });
  }

  async update(id: string, dto: UpdateTaskDto, userId: string) {
    const existing = await this.findOne(id);
    const { memberIds, labelIds, dueDate, ...rest } = dto;

    // Log status/priority changes for the "Updates" activity feed
    const activities: { action: string }[] = [];
    if (dto.status && dto.status !== existing.status) {
      activities.push({ action: `changed status from ${existing.status} to ${dto.status}` });
    }
    if (dto.priority && dto.priority !== existing.priority) {
      activities.push({ action: `changed priority from ${existing.priority} to ${dto.priority}` });
    }

    const task = await this.prisma.task.update({
      where: { id },
      data: {
        ...rest,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        members: memberIds
          ? { deleteMany: {}, create: memberIds.map((uid) => ({ userId: uid })) }
          : undefined,
        labels: labelIds
          ? { deleteMany: {}, create: labelIds.map((lid) => ({ labelId: lid })) }
          : undefined,
      },
      include: TASK_INCLUDE,
    });

    if (activities.length) {
      await this.prisma.activityLog.createMany({
        data: activities.map((a) => ({ ...a, taskId: id, userId })),
      });
    }

    return task;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.task.delete({ where: { id } });
    return { success: true };
  }

  async addSubtask(taskId: string, dto: CreateSubtaskDto) {
    await this.findOne(taskId);
    return this.prisma.subtask.create({
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        taskId,
      },
    });
  }

  async addComment(taskId: string, dto: CreateCommentDto, authorId: string) {
    await this.findOne(taskId);
    return this.prisma.comment.create({
      data: { content: dto.content, taskId, authorId },
      include: { author: true },
    });
  }
}