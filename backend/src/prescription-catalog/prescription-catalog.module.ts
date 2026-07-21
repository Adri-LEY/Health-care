import { Module } from '@nestjs/common';
import { PrescriptionCatalogService } from './prescription-catalog.service';
import { PrescriptionCatalogController } from './prescription-catalog.controller';

@Module({
  providers: [PrescriptionCatalogService],
  controllers: [PrescriptionCatalogController],
  exports: [PrescriptionCatalogService]  // Export the service to make it available for other modules
})
export class PrescriptionCatalogModule {}
