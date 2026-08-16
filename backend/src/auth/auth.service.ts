import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthProvider } from '@prisma/client';
import { verifyFirebaseIdToken } from './firebase-admin';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  /**
   * "Continue as Guest" — creates a throwaway user with no password so
   * reviewers/graders can try the app instantly.
   */
  async createGuest() {
    const suffix = randomBytes(4).toString('hex');
    const user = await this.prisma.user.create({
      data: {
        email: `guest-${suffix}@guest.pyramid.local`,
        name: `Guest ${suffix.slice(0, 4).toUpperCase()}`,
        username: `guest_${suffix}`,
        provider: AuthProvider.GUEST,
        isGuest: true,
      },
    });
    return this.issueToken(user.id, user.email);
  }

  // "Login with Google" — verifies the ID token Firebase Auth gave the
  // frontend after its Google sign-in popup, then upserts our own User row.
  async loginWithFirebaseGoogle(idToken: string) {
    let decoded;
    try {
      decoded = await verifyFirebaseIdToken(idToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired Google sign-in token');
    }

    if (!decoded.email) {
      throw new UnauthorizedException('Google account did not return an email address');
    }

    return this.findOrCreateGoogleUser({
      email: decoded.email,
      name: (decoded.name as string) ?? decoded.email.split('@')[0],
      avatarUrl: decoded.picture as string | undefined,
    });
  }

  async findOrCreateGoogleUser(profile: { email?: string; name?: string; avatarUrl?: string }) {
    if (!profile.email) {
      throw new Error('Google profile did not return an email');
    }
    const user = await this.prisma.user.upsert({
      where: { email: profile.email },
      update: {
        name: profile.name ?? undefined,
        avatarUrl: profile.avatarUrl ?? undefined,
      },
      create: {
        email: profile.email,
        name: profile.name,
        avatarUrl: profile.avatarUrl,
        provider: AuthProvider.GOOGLE,
        isGuest: false,
      },
    });
    return this.issueToken(user.id, user.email);
  }

  issueToken(userId: string, email: string) {
    const token = this.jwt.sign({ sub: userId, email });
    return { token, userId };
  }

  async me(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }
}
