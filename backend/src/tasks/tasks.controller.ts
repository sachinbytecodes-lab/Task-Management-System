import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { TasksService } from './tasks.service';
import { AddCommentDto, AddResourceDto, AddSubtaskDto, CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

function ownerId(req: Request) {
  return (req.user as any).userId as string;
}

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly service: TasksService) {}

  @Get()
  findAll(@Req() req: Request, @Query('project') project?: string) {
    return this.service.findAll(ownerId(req), project);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    return this.service.findOne(ownerId(req), id);
  }

  @Post()
  create(@Req() req: Request, @Body() dto: CreateTaskDto) {
    return this.service.create(ownerId(req), dto);
  }

  @Patch(':id')
  update(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.service.update(ownerId(req), id, dto);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    return this.service.remove(ownerId(req), id);
  }

  @Post(':id/subtasks')
  addSubtask(@Req() req: Request, @Param('id') id: string, @Body() dto: AddSubtaskDto) {
    return this.service.addSubtask(ownerId(req), id, dto);
  }

  @Post(':id/comments')
  addComment(@Req() req: Request, @Param('id') id: string, @Body() dto: AddCommentDto) {
    return this.service.addComment(ownerId(req), id, ownerId(req), dto);
  }

  @Post(':id/resources')
  addResource(@Req() req: Request, @Param('id') id: string, @Body() dto: AddResourceDto) {
    return this.service.addResource(ownerId(req), id, dto);
  }

  @Delete(':id/resources/:resourceId')
  removeResource(@Req() req: Request, @Param('id') id: string, @Param('resourceId') resourceId: string) {
    return this.service.removeResource(ownerId(req), id, resourceId);
  }
}
