import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { TaskPriority } from '@prisma/client';

export class CreateProjectDto {
  @IsString()
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  leadId?: string;
}
