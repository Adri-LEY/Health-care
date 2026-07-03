import { Module } from '@nestjs/common';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [AuthModule], 
  controllers: [StaffController],
  providers: [StaffService, PrismaService],
})
export class StaffModule {}
