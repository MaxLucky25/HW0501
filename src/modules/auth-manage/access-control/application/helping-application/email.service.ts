import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  private async sendEmailWithRetry(
    emailData: any,
    emailType: string,
    maxRetries: number = 2,
  ): Promise<void> {
    console.log(
      `${emailType}: Starting ${maxRetries} attempts - first immediately, second after 2s`,
    );

    let lastError: Error | undefined;
    let hasSuccess = false;

    // Первая попытка - сразу
    try {
      console.log(`${emailType}: Attempt 1/2 (immediate)`);

      const timeoutPromise1 = new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error(`Email timeout after 8 seconds (attempt 1)`)),
          8000,
        );
      });

      const emailPromise1 = this.mailerService.sendMail(emailData);

      await Promise.race([emailPromise1, timeoutPromise1]);

      console.log(`${emailType}: SUCCESS on attempt 1`);
      hasSuccess = true;
    } catch (error) {
      lastError = error as Error;
      console.log(`${emailType}: FAILED on attempt 1:`, error.message);
    }

    // Ждем 2 секунды перед второй попыткой
    console.log(`${emailType}: Waiting 2 seconds before second attempt...`);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Вторая попытка - через 2 секунды
    try {
      console.log(`${emailType}: Attempt 2/2 (after 2s delay)`);

      const timeoutPromise2 = new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error(`Email timeout after 8 seconds (attempt 2)`)),
          8000,
        );
      });

      const emailPromise2 = this.mailerService.sendMail(emailData);

      await Promise.race([emailPromise2, timeoutPromise2]);

      console.log(`${emailType}: SUCCESS on attempt 2`);
      hasSuccess = true;
    } catch (error) {
      lastError = error as Error;
      console.log(`${emailType}: FAILED on attempt 2:`, error.message);
    }

    // Если хотя бы одна попытка успешна - возвращаем успех
    if (hasSuccess) {
      console.log(`${emailType}: At least one attempt succeeded`);
      return;
    }

    // Если обе попытки неудачны
    console.error(`${emailType}: Both attempts failed`);
    throw lastError || new Error('Email sending failed');
  }

  async sendConfirmationEmail(email: string, code: string): Promise<void> {
    const emailData = {
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

    await this.sendEmailWithRetry(emailData, 'ConfirmationEmail');
  }

  async sendRecoveryEmail(email: string, recoveryCode: string): Promise<void> {
    const emailData = {
      to: email,
      subject: 'Восстановление пароля',
      text: `Восстановите пароль по ссылке: https://somesite.com/recover?code=${recoveryCode}`,
      html: `
        <h1>Password Recovery</h1>
        <p>To reset your password please follow the link below:
            <a href='https://somesite.com/recover?code=${recoveryCode}'>reset password</a>
        </p>
      `,
    };

    await this.sendEmailWithRetry(emailData, 'RecoveryEmail');
  }
}
