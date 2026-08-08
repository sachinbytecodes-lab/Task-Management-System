import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  _id: Types.ObjectId;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop()
  title?: string;

  @Prop()
  username?: string;

  @Prop()
  avatarUrl?: string;

  @Prop({ default: false })
  isGuest: boolean;

  @Prop()
  googleId?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
