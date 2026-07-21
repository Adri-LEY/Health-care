import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { PrescriptionCatalogService } from './prescription-catalog.service';

@Controller('prescription-catalog')
export class PrescriptionCatalogController {
  constructor(private readonly catalogService: PrescriptionCatalogService) {}

  // --- MÉDICAMENTS ---
  @Get('medications')
  getMedications() {
    return this.catalogService.findAllMedications();
  }

  // --- ÉQUIPEMENTS ---
  @Get('equipments')
  getEquipments() {
    return this.catalogService.findAllEquipments();
  }

  // --- SOINS ---
  @Get('cares')
  getCares() {
    return this.catalogService.findAllCares();
  }
}