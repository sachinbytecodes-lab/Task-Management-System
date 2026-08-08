import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  findById(id: string) {
    return this.userModel.findById(id).exec();
  }

  findByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  findByGoogleId(googleId: string) {
    return this.userModel.findOne({ googleId }).exec();
  }

  createGuest() {
    const suffix = Math.random().toString(36).slice(2, 8);
    return this.userModel.create({
      fullName: `Guest ${suffix}`,
      email: `guest-${suffix}@pyramid.local`,
      username: `guest_${suffix}`,
      isGuest: true,
      profileComplete: true,
    });
  }

  // Google gives us a verified email, but per product requirement we do NOT
  // auto-fill the display name — the user completes fullName/title/username
  // themselves on first login (see /onboarding on the frontend).
  createGoogleUser(data: { email: string; googleId: string; avatarUrl?: string }) {
    return this.userModel.create({
      fullName: '',
      email: data.email,
      googleId: data.googleId,
      avatarUrl: data.avatarUrl,
      isGuest: false,
      profileComplete: false,
    });
  }

  async update(id: string, data: Partial<User>) {
    return this.userModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  findAll() {
    return this.userModel.find().exec();
  }
}
