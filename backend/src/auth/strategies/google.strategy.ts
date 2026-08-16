import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    super({
      clientID: config.get<string>('GOOGLE_CLIENT_ID') ?? 'missing-client-id',
      clientSecret: config.get<string>('GOOGLE_CLIENT_SECRET') ?? 'missing-client-secret',
      callbackURL: config.get<string>('GOOGLE_CALLBACK_URL') ?? 'http://localhost:4000/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  validate(_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback) {
    const email = profile.emails?.[0]?.value;

    // Google doesn't always return displayName (some accounts have it blank,
    // or the consent screen scope config can omit it). Fall back through
    // given+family name, then the email's local part, so we never try to
    // save a User with an empty fullName (which Mongoose rejects).
    const nameFromParts = [profile.name?.givenName, profile.name?.familyName].filter(Boolean).join(' ').trim();
    const fullName = profile.displayName?.trim() || nameFromParts || email?.split('@')[0] || 'Google User';

    const user = {
      googleId: profile.id,
      email,
      fullName,
      avatarUrl: profile.photos?.[0]?.value,
    };
    done(null, user);
  }
}
