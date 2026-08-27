import { Module } from '@nestjs/common';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { StaffRepository } from './staff.repository';

@Module({
  imports: [InfrastructureModule],
  controllers: [StaffController],
  providers: [StaffService, StaffRepository],
})
export class StaffModule {}
