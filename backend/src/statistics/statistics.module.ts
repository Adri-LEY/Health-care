import { Module } from '@nestjs/common';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { PatientsRepository } from 'src/patients/patients.repository';
import { AppointmentsRepository } from 'src/appointments/appointments.repository';
import { StaffRepository } from 'src/staff/staff.repository';

@Module({
  controllers: [StatisticsController],
  providers: [
    StatisticsService, 
    PatientsRepository, 
    AppointmentsRepository, 
    StaffRepository
  ],
})
export class StatisticsModule {}
