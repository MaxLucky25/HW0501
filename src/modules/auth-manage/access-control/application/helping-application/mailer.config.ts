import { MailerOptions } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

export const getMailerConfig = (
  configService: ConfigService,
): MailerOptions => {
  const emailUser = configService.getOrThrow<string>('EMAIL_USER');

  return {
    transport: {
      host: 'smtp.yandex.ru',
      port: 587,
      secure: false, // true для 465, false для других портов
      auth: {
        user: emailUser,
        pass: configService.getOrThrow<string>('EMAIL_PASS'),
      },
    },
    defaults: {
      from: emailUser, // From должен совпадать с auth.user
    },
  };
};
