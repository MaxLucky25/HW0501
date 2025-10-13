import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  async sendConfirmationEmail(email: string, code: string): Promise<void> {
    console.log('=== EMAIL SERVICE ===');
    console.log('Email:', email);
    console.log('Code:', code);
    console.log('Mailer service available:', !!this.mailerService);

    const mailOptions = {
      to: email,
      subject: 'Подтверждение регистрации',
      text: `Подтвердите регистрацию по ссылке: https://somesite.com/confirm-email?code=${code}`,
      html: `
        <h1>Thank for your registration</h1>
        <p>To finish registration please follow the link below:
            <a href='https://somesite.com/confirm-email?code=${code}'>complete registration</a>
        </p>
      `,
    };

    console.log('Mail options:', JSON.stringify(mailOptions, null, 2));

    try {
      await this.mailerService.sendMail(mailOptions);
      console.log('Email sent successfully via mailer service');
    } catch (error) {
      console.error('Mailer service error:', error);
      throw error;
    }
  }

  async sendRecoveryEmail(email: string, recoveryCode: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Восстановление пароля',
      text: `Восстановите пароль по ссылке: https://somesite.com/recover?code=${recoveryCode}`,
      html: `
        <h1>Password Recovery</h1>
        <p>To reset your password please follow the link below:
            <a href='https://somesite.com/recover?code=${recoveryCode}'>reset password</a>
        </p>
      `,
    });
  }
}
