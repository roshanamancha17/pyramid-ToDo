import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LabelsService } from './labels.service';

class CreateLabelDto {
  @IsString()
  @MaxLength(60)
  name!: string;

  @IsOptional()
  @IsString()
  color?: string;
}

@UseGuards(JwtAuthGuard)
@Controller('labels')
export class LabelsController {
  constructor(private readonly labelsService: LabelsService) {}

  @Get()
  findAll() {
    return this.labelsService.findAll();
  }

  @Post()
  create(@Body() dto: CreateLabelDto) {
    return this.labelsService.create(dto.name, dto.color);
  }
}
