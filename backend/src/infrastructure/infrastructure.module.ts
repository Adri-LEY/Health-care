import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MailerModule } from '@nestjs-modules/mailer';
import { PrismaService } from '../prisma/prisma.service';

const jwtModule = JwtModule.register({
  secret: process.env.JWT_SECRET,
  signOptions: {
    expiresIn: (process.env.JWT_EXPIRATION || '1d') as any,
  },
});

const mailerModule = MailerModule.forRootAsync({
  useFactory: () => ({
    transport: {
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    },
    defaults: {
      from: process.env.MAIL_FROM,
    },
  }),
});

@Global()
@Module({
  imports: [jwtModule, mailerModule],
  providers: [PrismaService],
  exports: [PrismaService, jwtModule, mailerModule],
})
export class InfrastructureModule {}