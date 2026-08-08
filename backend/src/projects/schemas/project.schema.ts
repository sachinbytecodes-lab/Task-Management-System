import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProjectDocument = Project & Document;

export const PRIORITIES = ['No Priority', 'Urgent', 'High', 'Medium', 'Low'] as const;

@Schema({ timestamps: true })
export class Project {
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ enum: PRIORITIES, default: 'No Priority' })
  priority: string;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  lead: Types.ObjectId | null;

  @Prop()
  dueDate?: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
