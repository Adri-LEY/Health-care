import { Controller, Get } from '@nestjs/common';
import { ServiceService } from './service.service';

@Controller('service')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Get('getAllServices')
  async getAllServices() {
    return this.serviceService.getAllServices();
  }
}
