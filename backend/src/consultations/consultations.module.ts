import { Module } from '@nestjs/common';
import { ConsultationsService } from './consultations.service';
import { ConsultationsController } from './consultations.controller';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';
import ConsultationsRepository from './consultations.repository';
import { PrescriptionCatalogModule } from 'src/prescription-catalog/prescription-catalog.module';

@Module({
  imports: [InfrastructureModule, PrescriptionCatalogModule],
  providers: [ConsultationsService, ConsultationsRepository],
  controllers: [ConsultationsController]
})
export class ConsultationsModule {}
