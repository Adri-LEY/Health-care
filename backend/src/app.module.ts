import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StaffModule } from './staff/staff.module';
import { SpecialtyModule } from './specialty/specialty.module';
import { ServiceModule } from './service/service.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { PatientsModule } from './patients/patients.module';
import { ConsultationsModule } from './consultations/consultations.module';

@Module({
  imports: [InfrastructureModule, AuthModule, UsersModule, StaffModule, SpecialtyModule, ServiceModule, PatientsModule, ConsultationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
