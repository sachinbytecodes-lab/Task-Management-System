import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task, TaskDocument } from './schemas/task.schema';
import { AddCommentDto, AddSubtaskDto, CreateTaskDto, UpdateTaskDto } from './dto/task.dto';

@Injectable()
export class TasksService {
  constructor(@InjectModel(Task.name) private model: Model<TaskDocument>) {}

  findAll(projectId?: string) {
    const filter = projectId ? { project: projectId } : {};
    return this.model
      .find(filter)
      .populate('member')
      .populate('comments.author')
      .populate('subtasks.member')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string) {
    const task = await this.model
      .findById(id)
      .populate('member')
      .populate('comments.author')
      .populate('subtasks.member')
      .exec();
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  create(dto: CreateTaskDto) {
    return this.model.create(dto);
  }

  async update(id: string, dto: UpdateTaskDto) {
    const task = await this.model.findByIdAndUpdate(id, dto, { new: true }).populate('member').exec();
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async remove(id: string) {
    const res = await this.model.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Task not found');
    return { success: true };
  }

  async addSubtask(id: string, dto: AddSubtaskDto) {
    const task = await this.model.findById(id).exec();
    if (!task) throw new NotFoundException('Task not found');
    task.subtasks.push(dto as any);
    await task.save();
    return task.populate('subtasks.member');
  }

  async addComment(id: string, authorId: string, dto: AddCommentDto) {
    const task = await this.model.findById(id).exec();
    if (!task) throw new NotFoundException('Task not found');
    task.comments.push({ author: authorId, text: dto.text } as any);
    await task.save();
    return task.populate('comments.author');
  }
}
