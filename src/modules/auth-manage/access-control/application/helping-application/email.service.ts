import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  async sendConfirmationEmail(email: string, code: string): Promise<void> {
    console.log(
      'EmailService: sendConfirmationEmail called with email:',
      email,
      'code:',
      code,
    );

    const maxRetries = 3;
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`EmailService: Attempt ${attempt}/${maxRetries}`);

        const result = await this.mailerService.sendMail({
          to: email,
          subject: 'Подтверждение регистрации',
          text: `Подтвердите регистрацию по ссылке: https://somesite.com/confirm-email?code=${code}`,
          html: `
            <h1>Thanks for your registration</h1>
            <p>To finish registration please follow the link below:
                <a href='https://somesite.com/confirm-email?code=${code}'>complete registration</a>
            </p>
          `,
        });

        console.log(
          'EmailService: Email sent successfully, messageId:',
          result.messageId,
        );
        return; // Успешно отправлено, выходим
      } catch (error: any) {
        lastError = error;
        console.error(
          `EmailService: Attempt ${attempt} failed:`,
          error.message,
        );

        // Если это ошибка 454 "Try again later", ждем и пробуем снова
        if (error.responseCode === 454 && attempt < maxRetries) {
          const delay = attempt * 5000; // 5, 10, 15 секунд
          console.log(`EmailService: Waiting ${delay}ms before retry...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        // Если это не 454 или последняя попытка, выбрасываем ошибку
        throw error;
      }
    }

    // Если все попытки исчерпаны
    throw lastError;
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
