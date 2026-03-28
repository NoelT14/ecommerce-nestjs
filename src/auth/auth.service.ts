import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UserService } from '../user/user.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly mailService: MailService,
  ) { }

  async register(dto: RegisterDto) {
    const existing = await this.userService.findByEmail(dto.email);
    if (existing) throw new BadRequestException('Email already in use');

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const activationLink = crypto.randomUUID();

    const user = await this.userService.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      password: hashedPassword,
      activationLink,
    });

    this.mailService.sendVerificationEmail(user.email, user.firstName, activationLink)
      .catch((err) => console.error('Verification email failed:', err));


    return {
      message: 'Registration successful. Please verify your email.',
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user?.isEmailVerified) {
      throw new UnauthorizedException('Email not verified');
    }
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.generateTokens(user.id, user.email);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string) {
    await this.userService.update(userId, { refreshToken: null });
    return { message: 'Logged out successfully' };
  }

  async refreshTokens(userId: string, email: string) {
    const tokens = await this.generateTokens(userId, email);
    await this.storeRefreshToken(userId, tokens.refreshToken);
    return tokens;
  }

  async verifyEmail(token: string) {
    const user = await this.userService.findByActivationLink(token);
    if (!user) throw new BadRequestException('Invalid or expired verification token');
    if (user.isEmailVerified) throw new BadRequestException('Email is already verified');

    await this.userService.update(user.id, {
      isEmailVerified: true,
      activationLink: null,
    });

    return { message: 'Email verified successfully' };
  }

  async forgotPassword(email: string) {
    const user = await this.userService.findByEmail(email);
    //prevent user enumeration
    if (!user) return { message: 'If that email is registered, a reset link has been sent.' };

    const resetToken = crypto.randomUUID();

    // Sign a short-lived JWT wrapping the token
    const signedToken = this.jwtService.sign(
      { sub: user.id, token: resetToken },
      {
        secret: this.config.getOrThrow<string>('JWT_RESET_SECRET'),
        expiresIn: '1h',
      },
    );

    await this.userService.update(user.id, { resetPassword: resetToken });

    this.mailService.sendPasswordResetEmail(user.email, user.firstName, signedToken)
      .catch((err) => console.error('Reset email failed:', err));

    return { message: 'If that email is registered, a reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    let payload: { sub: string; token: string };

    try {
      payload = this.jwtService.verify(token, {
        secret: this.config.getOrThrow<string>('JWT_RESET_SECRET'),
      });
    } catch {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const user = await this.userService.findById(payload.sub);
    if (!user || user.resetPassword !== payload.token) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await this.userService.update(user.id, {
      password: hashedPassword,
      resetPassword: null,
      refreshToken: null,
    });

    return { message: 'Password reset successfully. Please log in again.' };
  }

  async resendVerificationEmail(userId: string) {
    const user = await this.userService.findById(userId);
    if (!user) throw new UnauthorizedException();
    if (user.isEmailVerified) throw new BadRequestException('Email is already verified');

    const activationLink = crypto.randomUUID();
    await this.userService.update(user.id, { activationLink });

    this.mailService.sendVerificationEmail(user.email, user.firstName, activationLink)
      .catch((err) => console.error('Resend verification failed:', err));

    return { message: 'Verification email sent' };
  }

  private async generateTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
          expiresIn: (this.config.get<string>('JWT_ACCESS_EXPIRES_IN', '15m')) as never,
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
          expiresIn: (this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '7d')) as never,
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const hashed = await bcrypt.hash(refreshToken, 10);
    await this.userService.update(userId, { refreshToken: hashed });
  }

  async guestToken(): Promise<{ guestToken: string }> {
    const guestId = crypto.randomUUID()
    const guestToken = await this.jwtService.signAsync({ guestId, isGuest: true as const },
      {
        secret: this.config.getOrThrow<string>('JWT_GUEST_SECRET'),
        expiresIn: (this.config.get<string>('JWT_GUEST_EXPIRES_IN', '24h')) as never,
      })

    return { guestToken };
  }
}
