import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProjectDocument = Project & Document;

export const PRIORITIES = ['No Priority', 'Urgent', 'High', 'Medium', 'Low'] as const;
export const STATUSES = ['To Do', 'Doing', 'Completed', 'On Hold'] as const;

@Schema({ timestamps: true })
export class Project {
  _id: Types.ObjectId;

  // Scopes every project to the guest/Google account that created it.
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  owner: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ enum: STATUSES, default: 'To Do' })
  status: string;

  @Prop({ enum: PRIORITIES, default: 'No Priority' })
  priority: string;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  lead: Types.ObjectId | null;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  members: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  reporter: Types.ObjectId | null;

  @Prop({ type: [String], default: [] })
  teams: string[];

  @Prop({ type: [String], default: [] })
  labels: string[];

  @Prop()
  dueDate?: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
