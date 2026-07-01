import { Controller, Get } from '@nestjs/common';
import { SpecialtyService } from './specialty.service';

@Controller('specialty')
export class SpecialtyController {
  constructor(private readonly specialtyService: SpecialtyService) {}

  @Get('getAllSpecialties')
  async getAllSpecialties() {
    return this.specialtyService.getAllSpecialties();
  }
}
