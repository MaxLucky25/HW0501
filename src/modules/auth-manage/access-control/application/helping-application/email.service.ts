import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  constructor(private configService: ConfigService) {
    // Инициализируем SendGrid с API ключом (используем старые переменные)
    sgMail.setApiKey(this.configService.getOrThrow<string>('EMAIL_PASS'));
  }

  async sendConfirmationEmail(email: string, code: string): Promise<void> {
    const msg = {
      to: email,
      from: this.configService.getOrThrow<string>('EMAIL_USER'),
      subject: 'Подтверждение регистрации',
      text: `Подтвердите регистрацию по ссылке: https://somesite.com/confirm-email?code=${code}`,
      html: `
        <h1>Thank for your registration</h1>
        <p>To finish registration please follow the link below:
            <a href='https://somesite.com/confirm-email?code=${code}'>complete registration</a>
        </p>
      `,
    };

    await sgMail.send(msg);
  }

  async sendRecoveryEmail(email: string, recoveryCode: string): Promise<void> {
    const msg = {
      to: email,
      from: this.configService.getOrThrow<string>('EMAIL_USER'),
      subject: 'Восстановление пароля',
      text: `Восстановите пароль по ссылке: https://somesite.com/recover?code=${recoveryCode}`,
      html: `
        <h1>Password Recovery</h1>
        <p>To reset your password please follow the link below:
            <a href='https://somesite.com/recover?code=${recoveryCode}'>reset password</a>
        </p>
      `,
    };

    await sgMail.send(msg);
  }
}
