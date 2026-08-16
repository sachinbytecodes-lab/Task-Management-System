import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task, TaskDocument } from './schemas/task.schema';
import { AddCommentDto, AddResourceDto, AddSubtaskDto, CreateTaskDto, UpdateTaskDto } from './dto/task.dto';

const POPULATE_FIELDS = ['member', 'reporter', 'comments.author', 'subtasks.member', 'updates.user', 'watchers'];

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

  // Builds a human-readable activity log entry for every tracked field that
  // actually changed, so the "Updates" section on the task detail page has
  // real history instead of the old two hardcoded mock lines.
  private buildUpdateLog(existing: TaskDocument, dto: UpdateTaskDto, actorId: string) {
    const logs: { user: string; message: string }[] = [];
    const push = (message: string) => logs.push({ user: actorId, message });

    if (dto.title !== undefined && dto.title !== existing.title) {
      push('renamed the task');
    }
    if (dto.status !== undefined && dto.status !== existing.status) {
      push(`changed status from "${existing.status}" to "${dto.status}"`);
    }
    if (dto.priority !== undefined && dto.priority !== existing.priority) {
      push(`changed priority from "${existing.priority}" to "${dto.priority}"`);
    }
    if (dto.member !== undefined) {
      const next = dto.member || null;
      const prev = existing.member ? existing.member.toString() : null;
      if (next !== prev) push(next ? 'assigned a member' : 'removed the assigned member');
    }
    if (dto.reporter !== undefined) {
      const next = dto.reporter || null;
      const prev = existing.reporter ? existing.reporter.toString() : null;
      if (next !== prev) push('changed the reporter');
    }
    if (dto.dueDate !== undefined && dto.dueDate !== existing.dueDate) {
      push(`set the due date to "${dto.dueDate}"`);
    }
    if (dto.labels !== undefined && JSON.stringify(dto.labels) !== JSON.stringify(existing.labels)) {
      push('updated labels');
    }
    if (dto.teams !== undefined && JSON.stringify(dto.teams) !== JSON.stringify(existing.teams)) {
      push('updated teams');
    }
    if (dto.description !== undefined && dto.description !== existing.description) {
      push('updated the description');
    }
    if (dto.locked !== undefined && dto.locked !== existing.locked) {
      push(dto.locked ? 'locked this task' : 'unlocked this task');
    }
    return logs;
  }

  async update(ownerId: string, id: string, dto: UpdateTaskDto) {
    const existing = await this.model.findOne({ _id: id, owner: ownerId }).exec();
    if (!existing) throw new NotFoundException('Task not found');

    // Watching/unwatching and unlocking itself must still work on a locked task —
    // only block edits to actual task fields.
    //
    // NOTE: this must check each field's *value* against undefined, not use
    // Object.keys(dto) — under this project's TS target (ES2023), every
    // declared class field becomes an own property (initialized to
    // undefined) the moment the DTO is constructed, whether or not the
    // client actually sent it. Object.keys(dto) therefore lists *all*
    // UpdateTaskDto fields, not just the ones present in the request body,
    // which made this guard fire on every request — including a bare
    // { locked: false } unlock call — because it always "saw" other
    // (undefined-valued) fields as present.
    const isEditingRealFields =
      dto.title !== undefined ||
      dto.description !== undefined ||
      dto.status !== undefined ||
      dto.priority !== undefined ||
      dto.member !== undefined ||
      dto.reporter !== undefined ||
      dto.dueDate !== undefined ||
      dto.labels !== undefined ||
      dto.teams !== undefined ||
      dto.project !== undefined;

    if (existing.locked && isEditingRealFields) {
      throw new ForbiddenException('Task is locked');
    }

    const logs = this.buildUpdateLog(existing, dto, ownerId);

    const setFields: Record<string, unknown> = { ...dto };
    if ('member' in setFields && setFields.member === '') setFields.member = null;
    if ('reporter' in setFields && setFields.reporter === '') setFields.reporter = null;

    const update: Record<string, unknown> = { $set: setFields };
    if (logs.length) update.$push = { updates: { $each: logs } };

    let query = this.model.findOneAndUpdate({ _id: id, owner: ownerId }, update, { new: true });
    for (const f of POPULATE_FIELDS) query = query.populate(f);
    const task = await query.exec();
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
    task.updates.push({ user: ownerId as any, message: `added subtask "${dto.title}"` } as any);
    await task.save();
    for (const f of POPULATE_FIELDS) await task.populate(f);
    return task;
  }

  async addComment(ownerId: string, id: string, authorId: string, dto: AddCommentDto) {
    const task = await this.model.findOne({ _id: id, owner: ownerId }).exec();
    if (!task) throw new NotFoundException('Task not found');
    task.comments.push({ author: authorId, text: dto.text } as any);
    await task.save();
    for (const f of POPULATE_FIELDS) await task.populate(f);
    return task;
  }

  async addResource(ownerId: string, id: string, dto: AddResourceDto) {
    const task = await this.model.findOne({ _id: id, owner: ownerId }).exec();
    if (!task) throw new NotFoundException('Task not found');
    if (task.locked) throw new ForbiddenException('Task is locked');
    task.resources.push(dto as any);
    task.updates.push({ user: ownerId as any, message: `attached "${dto.title}"` } as any);
    await task.save();
    for (const f of POPULATE_FIELDS) await task.populate(f);
    return task;
  }

  async removeResource(ownerId: string, id: string, resourceId: string) {
    const task = await this.model.findOne({ _id: id, owner: ownerId }).exec();
    if (!task) throw new NotFoundException('Task not found');
    if (task.locked) throw new ForbiddenException('Task is locked');
    const resource = task.resources.find((r: any) => r._id.toString() === resourceId);
    task.resources = task.resources.filter((r: any) => r._id.toString() !== resourceId) as any;
    if (resource) task.updates.push({ user: ownerId as any, message: `removed "${resource.title}"` } as any);
    await task.save();
    for (const f of POPULATE_FIELDS) await task.populate(f);
    return task;
  }
}
