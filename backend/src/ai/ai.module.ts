import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';
import { BiometricsRepository } from 'src/biometrics/biometrics.repository';
import { PatientsRepository } from 'src/patients/patients.repository';
import { MedicalRecordRepository } from 'src/patients/medicalRecord.repository';

@Module({
  imports: [InfrastructureModule],
  providers: [AiService, BiometricsRepository, PatientsRepository, MedicalRecordRepository],
  controllers: [AiController]
})
export class AiModule {}
