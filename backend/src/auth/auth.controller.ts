import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

const COOKIE_NAME = 'pyramid_token';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  private setCookie(res: Response, token: string) {
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  @Post('guest')
  async guest(@Res({ passthrough: true }) res: Response) {
    const { token, user } = await this.authService.guestLogin();
    this.setCookie(res, token);
    return { token, user };
  }

  // Redirects to Google's consent screen
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth() {
    // handled by passport
  }

  // Google redirects back here after consent
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const { token, user } = await this.authService.googleLogin(req.user as any);
    this.setCookie(res, token);
    const frontendUrl = this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    const destination = user.profileComplete ? '/tasks' : '/onboarding';
    res.redirect(`${frontendUrl}${destination}`);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: Request) {
    return req.user;
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(COOKIE_NAME);
    return { success: true };
  }
}
