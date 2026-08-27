import { Controller, Get, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { SpecialtyService } from './specialty.service';
import { JwtGuard } from 'src/auth/jwt.guard';
import { UserStatusGuard } from 'src/auth/status.guard';

@Controller('specialty')
export class SpecialtyController {
  constructor(private readonly specialtyService: SpecialtyService) {}

  @Get('getAllSpecialties')
  @UseGuards(JwtGuard, UserStatusGuard)
  @HttpCode(HttpStatus.OK)
  async getAllSpecialties() {
    return this.specialtyService.getAllSpecialties();
  }
}
