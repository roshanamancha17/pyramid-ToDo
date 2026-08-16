import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  // Scoped to the current user (owner or lead), same reasoning as
  // TasksService.findAll — each user gets their own project list.
  async findAll(userId: string) {
    return this.prisma.project.findMany({
      where: { OR: [{ ownerId: userId }, { leadId: userId }] },
      include: { lead: true, owner: true, _count: { select: { tasks: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        lead: true,
        owner: true,
        tasks: {
          include: {
            members: { include: { user: true } },
            labels: { include: { label: true } },
          },
          orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
        },
      },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async create(dto: CreateProjectDto, ownerId: string) {
    const { dueDate, ...rest } = dto;
    return this.prisma.project.create({
      data: {
        ...rest,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        ownerId,
      },
    });
  }

  async update(id: string, dto: UpdateProjectDto) {
    await this.findOne(id);
    const { dueDate, ...rest } = dto;
    return this.prisma.project.update({
      where: { id },
      data: { ...rest, dueDate: dueDate ? new Date(dueDate) : undefined },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.project.delete({ where: { id } });
    return { success: true };
  }
}