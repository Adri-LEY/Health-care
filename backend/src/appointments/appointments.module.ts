import { Module } from '@nestjs/common';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { AppointmentsRepository } from './appointments.repository';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';
import { UsersRepository } from 'src/users/users.repository';

@Module({
  imports: [InfrastructureModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, AppointmentsRepository, UsersRepository],
})
export class AppointmentsModule {}
