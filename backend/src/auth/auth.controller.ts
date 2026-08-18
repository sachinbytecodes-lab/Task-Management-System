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

  private cookieOptions() {
    const isProd = process.env.NODE_ENV === 'production';
    return {
      httpOnly: true,
      // Vercel (frontend) and Render (backend) are different domains in
      // production, which makes every request cross-site. SameSite=Lax is
      // inconsistently honored cross-site across browsers (notably Safari),
      // so we use SameSite=None (which requires Secure) in production, and
      // fall back to Lax locally where frontend/backend share `localhost`.
      sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',
      secure: isProd,
      path: '/',
    };
  }

  private setCookie(res: Response, token: string) {
    res.cookie(COOKIE_NAME, token, {
      ...this.cookieOptions(),
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
    // Must pass the SAME options used in setCookie (minus maxAge/expires) —
    // Express only recognizes this as "the same cookie" to clear if the
    // attributes match. This was the actual bug: clearCookie() was being
    // called with no options at all, so the real session cookie was never
    // invalidated and stayed valid until it naturally expired 7 days later.
    res.clearCookie(COOKIE_NAME, this.cookieOptions());
    return { success: true };
  }
}
