import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { SpecialtyService } from './specialty.service';

@Controller('specialty')
export class SpecialtyController {
  constructor(private readonly specialtyService: SpecialtyService) {}

  @Get('getAllSpecialties')
  @HttpCode(HttpStatus.OK)
  async getAllSpecialties() {
    return this.specialtyService.getAllSpecialties();
  }
}
