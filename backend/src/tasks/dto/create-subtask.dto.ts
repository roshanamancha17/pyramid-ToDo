import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { TaskPriority } from '@prisma/client';

export class CreateSubtaskDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
