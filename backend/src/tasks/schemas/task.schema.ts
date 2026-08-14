import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TaskDocument = Task & Document;

export const PRIORITIES = ['No Priority', 'Urgent', 'High', 'Medium', 'Low'] as const;
export const STATUSES = ['To Do', 'Doing', 'Completed', 'On Hold'] as const;

@Schema({ _id: true, timestamps: true })
export class Comment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: Types.ObjectId;

  @Prop({ required: true })
  text: string;
}
export const CommentSchema = SchemaFactory.createForClass(Comment);

@Schema({ _id: true })
export class Subtask {
  @Prop({ required: true })
  title: string;

  @Prop({ enum: PRIORITIES, default: 'No Priority' })
  priority: string;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  member: Types.ObjectId | null;

  @Prop()
  dueDate?: string;
}
export const SubtaskSchema = SchemaFactory.createForClass(Subtask);

@Schema({ _id: false, timestamps: { createdAt: true, updatedAt: false } })
export class UpdateLogEntry {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  message: string;
}
export const UpdateLogEntrySchema = SchemaFactory.createForClass(UpdateLogEntry);

@Schema({ timestamps: true })
export class Task {
  _id: Types.ObjectId;

  // Owner = the guest/Google account this task belongs to. Every list query is
  // scoped to req.user's own owner id, so different guest sessions never see
  // each other's data.
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  owner: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ enum: STATUSES, default: 'To Do', index: true })
  status: string;

  @Prop({ enum: PRIORITIES, default: 'No Priority' })
  priority: string;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  member: Types.ObjectId | null;

  // Who "reported"/created the task — defaults to owner at creation time,
  // but kept as its own field since a task can conceptually be reported by
  // someone other than its current owner in a multi-user workspace.
  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  reporter: Types.ObjectId | null;

  @Prop()
  dueDate?: string;

  @Prop({ type: [String], default: [] })
  labels: string[];

  @Prop({ type: [String], default: [] })
  teams: string[];

  @Prop({ type: Types.ObjectId, ref: 'Project', default: null, index: true })
  project: Types.ObjectId | null;

  @Prop({ type: [SubtaskSchema], default: [] })
  subtasks: Subtask[];

  @Prop({ type: [CommentSchema], default: [] })
  comments: Comment[];

  // Lock icon in the task detail header — a locked task blocks edits
  // (priority/status/members/etc, subtasks, comments) from the UI.
  @Prop({ default: false })
  locked: boolean;

  // Eye icon — users who are "watching" this task. Toggled by the current user.
  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  watchers: Types.ObjectId[];

  // Updates section — an append-only activity log of field changes,
  // populated automatically by the service whenever a tracked field changes.
  @Prop({ type: [UpdateLogEntrySchema], default: [] })
  updates: UpdateLogEntry[];
}

export const TaskSchema = SchemaFactory.createForClass(Task);
