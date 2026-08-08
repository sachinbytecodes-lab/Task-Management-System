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

@Schema({ timestamps: true })
export class Task {
  _id: Types.ObjectId;

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

  @Prop()
  dueDate?: string;

  @Prop({ type: [String], default: [] })
  labels: string[];

  @Prop({ type: Types.ObjectId, ref: 'Project', default: null, index: true })
  project: Types.ObjectId | null;

  @Prop({ type: [SubtaskSchema], default: [] })
  subtasks: Subtask[];

  @Prop({ type: [CommentSchema], default: [] })
  comments: Comment[];
}

export const TaskSchema = SchemaFactory.createForClass(Task);
