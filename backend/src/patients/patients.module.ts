import { Module } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { PatientsRepository } from './patients.repository';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';
import { StaffRepository } from 'src/staff/staff.repository';
import { MedicalRecordRepository } from './medicalRecord.repository';

@Module({
  imports: [InfrastructureModule],
  providers: [PatientsService, PatientsRepository, MedicalRecordRepository, StaffRepository],
  controllers: [PatientsController]
})
export class PatientsModule {}
