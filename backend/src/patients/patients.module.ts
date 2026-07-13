import { Module } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { PatientsRepository } from './patients.repository';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';

@Module({
  imports: [InfrastructureModule],
  providers: [PatientsService, PatientsRepository],
  controllers: [PatientsController]
})
export class PatientsModule {}
