import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly transporter: Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: config.getOrThrow<string>('MAIL_HOST'),
      port: config.get<number>('MAIL_PORT', 587),
      secure: config.get<number>('MAIL_PORT', 587) === 465,
      auth: {
        user: config.getOrThrow<string>('MAIL_USER'),
        pass: config.getOrThrow<string>('MAIL_PASS'),
      },
    });
  }

  async sendVerificationEmail(to: string, firstName: string, token: string): Promise<void> {
    const appUrl = this.config.get<string>('APP_URL', 'http://localhost:3000');
    const verifyUrl = `${appUrl}/auth/verify-email?token=${token}`;

    await this.transporter.sendMail({
      from: `"${this.config.get('MAIL_FROM_NAME', 'No Reply')}" <${this.config.getOrThrow('MAIL_FROM')}>`,
      to,
      subject: 'Verify your email address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hi ${firstName},</h2>
          <p>Thanks for signing up! Please verify your email address by clicking the button below.</p>
          <p>
            <a href="${verifyUrl}"
               style="display:inline-block;padding:12px 24px;background:#4F46E5;color:#fff;text-decoration:none;border-radius:4px;font-weight:bold;">
              Verify Email
            </a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break:break-all;color:#6B7280;">${verifyUrl}</p>
          <p>This link expires in <strong>24 hours</strong>.</p>
          <p style="color:#9CA3AF;font-size:12px;">If you didn't create an account, you can safely ignore this email.</p>
        </div>
      `,
    });

    this.logger.log(`Verification email sent to ${to}`);
  }

  async sendPasswordResetEmail(to: string, firstName: string, token: string): Promise<void> {
    const appUrl = this.config.get<string>('APP_URL', 'http://localhost:3000');
    const resetUrl = `${appUrl}/auth/reset-password?token=${token}`;

    await this.transporter.sendMail({
      from: `"${this.config.get('MAIL_FROM_NAME', 'No Reply')}" <${this.config.getOrThrow('MAIL_FROM')}>`,
      to,
      subject: 'Reset your password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hi ${firstName},</h2>
          <p>You requested a password reset. Click the button below to set a new password.</p>
          <p>
            <a href="${resetUrl}"
               style="display:inline-block;padding:12px 24px;background:#4F46E5;color:#fff;text-decoration:none;border-radius:4px;font-weight:bold;">
              Reset Password
            </a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break:break-all;color:#6B7280;">${resetUrl}</p>
          <p>This link expires in <strong>1 hour</strong>.</p>
          <p style="color:#9CA3AF;font-size:12px;">If you didn't request a password reset, please ignore this email. Your password will not be changed.</p>
        </div>
      `,
    });

    this.logger.log(`Password reset email sent to ${to}`);
  }
}
