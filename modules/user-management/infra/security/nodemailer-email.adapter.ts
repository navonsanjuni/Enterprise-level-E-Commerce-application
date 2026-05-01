import nodemailer from "nodemailer";
import { IEmailService, SendEmailOptions } from "../../application/services/iemail.service";

export class NodemailerEmailService implements IEmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === "development";
  }

  private async getTransporter(): Promise<nodemailer.Transporter> {
    if (this.transporter) {
      return this.transporter;
    }

    if (this.isDevelopment) {
      // Ethereal account for development
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`[EmailService] Ethereal account created: ${testAccount.user}`);
    } else {
      // Real SMTP for production (placeholders for now, should come from config)
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }

    return this.transporter;
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    const transporter = await this.getTransporter();

    const info = await transporter.sendMail({
      from: `"Tasheen Shop" <${process.env.SMTP_FROM || "noreply@tasheen.com"}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    if (this.isDevelopment) {
      console.log(`[EmailService] Email sent: ${info.messageId}`);
      console.log(`[EmailService] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${token}`;
    
    await this.sendEmail({
      to: email,
      subject: "Reset your password",
      text: `You requested a password reset. Please use this link: ${resetUrl}`,
      html: `
        <h1>Password Reset Request</h1>
        <p>You requested a password reset for your Tasheen account.</p>
        <p>Click the link below to set a new password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
    });
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verifyUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-email?token=${token}`;

    await this.sendEmail({
      to: email,
      subject: "Verify your email address",
      text: `Welcome to Tasheen! Please verify your email using this link: ${verifyUrl}`,
      html: `
        <h1>Welcome to Tasheen!</h1>
        <p>Please verify your email address to complete your registration:</p>
        <a href="${verifyUrl}">${verifyUrl}</a>
        <p>Thank you!</p>
      `,
    });
  }
}
