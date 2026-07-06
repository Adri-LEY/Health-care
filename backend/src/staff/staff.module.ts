import { Module } from '@nestjs/common';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from '../prisma/prisma.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { JwtModule } from '@nestjs/jwt/dist/jwt.module';

@Module({
  imports: [AuthModule,
    JwtModule.register({
          global: true,
          secret: process.env.JWT_SECRET,
          signOptions: {
            expiresIn: (process.env.JWT_EXPIRATION || '1d') as any,
          },
        }),

    MailerModule.forRootAsync({
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
        })
  ], 
  controllers: [StaffController],
  providers: [StaffService, PrismaService],
})
export class StaffModule {}
