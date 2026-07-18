import { Module } from '@nestjs/common';
import { ConsultationsService } from './consultations.service';
import { ConsultationsController } from './consultations.controller';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';
import ConsultationsRepository from './consultations.repository';

@Module({
  imports: [InfrastructureModule],
  providers: [ConsultationsService, ConsultationsRepository],
  controllers: [ConsultationsController]
})
export class ConsultationsModule {}
