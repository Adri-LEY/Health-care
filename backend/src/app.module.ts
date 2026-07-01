import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { UsersModule } from './users/users.module';
import { StaffModule } from './staff/staff.module';
import { SpecialtyModule } from './specialty/specialty.module';
import { ServiceModule } from './service/service.module';

@Module({
  imports: [AuthModule, UsersModule, StaffModule, SpecialtyModule, ServiceModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
