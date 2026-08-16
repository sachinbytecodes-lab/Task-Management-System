import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  _id: Types.ObjectId;

  // Not `required` — a fresh Google signup is intentionally created with an
  // empty fullName (see UsersService.createGoogleUser) so /onboarding can
  // prompt the person to fill it in themselves. `profileComplete` below is
  // what actually gates access, not this field.
  @Prop({ default: '' })
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
