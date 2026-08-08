import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
      fullName: 'Guest',
      email: `guest-${suffix}@pyramid.local`,
      username: `guest_${suffix}`,
      isGuest: true,
    });
  }

  createGoogleUser(data: { email: string; fullName: string; googleId: string; avatarUrl?: string }) {
    return this.userModel.create({ ...data, isGuest: false });
  }

  async update(id: string, data: Partial<User>) {
    return this.userModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  findAll() {
    return this.userModel.find().exec();
  }
}
