import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task, TaskDocument } from './schemas/task.schema';
import { AddCommentDto, AddSubtaskDto, CreateTaskDto, UpdateTaskDto } from './dto/task.dto';

const POPULATE_FIELDS = ['member', 'reporter', 'comments.author', 'subtasks.member'];

@Injectable()
export class TasksService {
  constructor(@InjectModel(Task.name) private model: Model<TaskDocument>) {}

  // Every read is scoped to the calling user's own tasks — different guest
  // sessions (and different Google accounts) never see each other's data.
  findAll(ownerId: string, projectId?: string) {
    const filter: Record<string, unknown> = { owner: ownerId };
    if (projectId) filter.project = projectId;
    let query = this.model.find(filter).sort({ createdAt: -1 });
    for (const f of POPULATE_FIELDS) query = query.populate(f);
    return query.exec();
  }

  async findOne(ownerId: string, id: string) {
    let query = this.model.findOne({ _id: id, owner: ownerId });
    for (const f of POPULATE_FIELDS) query = query.populate(f);
    const task = await query.exec();
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  create(ownerId: string, dto: CreateTaskDto) {
    return this.model.create({ ...dto, owner: ownerId, reporter: dto.reporter ?? ownerId });
  }

  async update(ownerId: string, id: string, dto: UpdateTaskDto) {
    const task = await this.model
      .findOneAndUpdate({ _id: id, owner: ownerId }, dto, { new: true })
      .populate('member')
      .populate('reporter')
      .exec();
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async remove(ownerId: string, id: string) {
    const res = await this.model.findOneAndDelete({ _id: id, owner: ownerId }).exec();
    if (!res) throw new NotFoundException('Task not found');
    return { success: true };
  }

  async addSubtask(ownerId: string, id: string, dto: AddSubtaskDto) {
    const task = await this.model.findOne({ _id: id, owner: ownerId }).exec();
    if (!task) throw new NotFoundException('Task not found');
    task.subtasks.push(dto as any);
    await task.save();
    return task.populate('subtasks.member');
  }

  async addComment(ownerId: string, id: string, authorId: string, dto: AddCommentDto) {
    const task = await this.model.findOne({ _id: id, owner: ownerId }).exec();
    if (!task) throw new NotFoundException('Task not found');
    task.comments.push({ author: authorId, text: dto.text } as any);
    await task.save();
    return task.populate('comments.author');
  }
}
