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

  // False for a fresh Google account until the user fills in name/title/username
  // themselves (see auth flow) — guests are considered complete immediately
  // since we generate a usable placeholder name for them.
  @Prop({ default: true })
  profileComplete: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
