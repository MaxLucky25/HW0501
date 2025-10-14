import { Module } from '@nestjs/common';
import { BcryptService } from './bcrypt.service';
import { EmailService } from './email.service';
import { JwtConfigService } from './jwt-config.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [BcryptService, EmailService, JwtConfigService],
  exports: [BcryptService, EmailService, JwtConfigService],
})
export class HelpingApplicationModule {}
