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
import { PrescriptionCatalogModule } from './prescription-catalog/prescription-catalog.module';
import { BiometricsModule } from './biometrics/biometrics.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [InfrastructureModule, AuthModule, UsersModule, StaffModule, SpecialtyModule, ServiceModule, PatientsModule, ConsultationsModule, PrescriptionCatalogModule, BiometricsModule, AppointmentsModule, AiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
