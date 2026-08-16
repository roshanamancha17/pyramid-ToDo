import {
  Controller,
  Post,
  Get,
  Res,
  Body,
  UseGuards,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { FirebaseLoginDto } from './dto/firebase-login.dto';
import { isFirebaseConfigured } from './firebase-admin';

const COOKIE_NAME = 'pyramid_token';
const isProd = process.env.NODE_ENV === 'production';
const COOKIE_OPTIONS = {
  httpOnly: true,
  // Frontend (Vercel) and backend (Railway/Render) live on different
  // domains in production, making every API call cross-site. SameSite=Lax
  // (fine for localhost, same-origin) silently drops the cookie on
  // cross-site fetch requests, so production needs 'none' — which browsers
  // only allow when 'secure' is also true (HTTPS only).
  sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',
  secure: isProd,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Matches the "Continue as Guest" button
  @Post('guest')
  async guest(@Res({ passthrough: true }) res: Response) {
    const { token, userId } = await this.authService.createGuest();
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
    return { userId };
  }

  // Matches the "Login with Google" button — frontend does the Firebase
  // sign-in popup and sends us the resulting ID token to verify.
  @Post('google')
  async google(
    @Body() dto: FirebaseLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!isFirebaseConfigured()) {
      throw new ServiceUnavailableException(
        'Google login is not configured on this server yet. Set FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY in backend/.env.',
      );
    }
    const { token } = await this.authService.loginWithFirebaseGoogle(dto.idToken);
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
    return { success: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: { userId: string }) {
    return this.authService.me(user.userId);
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(COOKIE_NAME);
    return { success: true };
  }
}