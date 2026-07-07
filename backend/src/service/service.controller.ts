import { Controller, Get, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ServiceService } from './service.service';
import { JwtGuard } from 'src/auth/jwt.guard';
import { UserStatusGuard } from 'src/auth/status.guard';

@Controller('service')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Get('getAllServices')
  @UseGuards(JwtGuard, UserStatusGuard)
  @HttpCode(HttpStatus.OK)
  async getAllServices() {
    return this.serviceService.getAllServices();
  }
}
