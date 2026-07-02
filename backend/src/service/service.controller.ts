import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ServiceService } from './service.service';

@Controller('service')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Get('getAllServices')
  @HttpCode(HttpStatus.OK)
  async getAllServices() {
    return this.serviceService.getAllServices();
  }
}
