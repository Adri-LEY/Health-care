import { Module } from '@nestjs/common';
import { BiometricsService } from './biometrics.service';
import { BiometricsController } from './biometrics.controller';
import { BiometricsRepository } from './biometrics.repository';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';

@Module({
  imports: [InfrastructureModule],
  providers: [BiometricsService, BiometricsRepository],
  controllers: [BiometricsController]
})
export class BiometricsModule {}
