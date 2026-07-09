import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { UsersRepository } from './users.repository';

@Module({
  imports: [InfrastructureModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
})
export class UsersModule {}