import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createTransport } from 'nodemailer';
import { MailService } from './mail.service';

@Module({
  imports: [ConfigModule],
  providers: [
    MailService,
    {
      provide: 'MAIL_TRANSPORTER',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const port = Number(configService.getOrThrow<string>('MAIL_PORT'));

        return createTransport({
          host: configService.getOrThrow<string>('MAIL_HOST'),
          port,
          secure: port === 465,
          auth: {
            user: configService.getOrThrow<string>('MAIL_USER'),
            pass: configService.getOrThrow<string>('MAIL_PASS'),
          },
        });
      },
    },
  ],
  exports: ['MAIL_TRANSPORTER', MailService],
})
export class MailModule {}
