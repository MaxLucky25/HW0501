import { MailerOptions } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

export const getMailerConfig = (
  configService: ConfigService,
): MailerOptions => {
  try {
    const emailUser = configService.getOrThrow<string>('EMAIL_USER');
    const emailPass = configService.getOrThrow<string>('EMAIL_PASS');

    console.log(`[MAILER] Config loaded successfully`);
    console.log(`[MAILER] User: ${emailUser}`);
    console.log(`[MAILER] Pass length: ${emailPass ? emailPass.length : 0}`);
    console.log(
      `[MAILER] Pass starts with: ${emailPass ? emailPass.substring(0, 3) : 'N/A'}`,
    );

    return {
      transport: {
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      },
    };
  } catch (error) {
    console.error(`[MAILER] Failed to load config:`);
    console.error(`[MAILER] Error: ${error.message}`);
    throw error;
  }
};
