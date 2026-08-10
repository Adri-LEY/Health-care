import { Module } from '@nestjs/common';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { AppointmentsRepository } from './appointments.repository';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';

@Module({
  imports: [InfrastructureModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, AppointmentsRepository],
})
export class AppointmentsModule {}
