import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private sign(user: { _id: any; email: string }) {
    return this.jwtService.sign({ sub: user._id.toString(), email: user.email });
  }

  async guestLogin() {
    const user = await this.usersService.createGuest();
    return { token: this.sign(user), user };
  }

  async googleLogin(profile: { googleId: string; email: string; fullName: string; avatarUrl?: string }) {
    let user = await this.usersService.findByGoogleId(profile.googleId);
    if (!user) {
      user = await this.usersService.findByEmail(profile.email);
    }
    if (!user) {
      user = await this.usersService.createGoogleUser(profile);
    }
    return { token: this.sign(user), user };
  }
}
