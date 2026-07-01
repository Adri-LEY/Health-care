import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { StaffService } from './staff.service';
import { Role } from '@prisma/client/edge';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get('getAllStaff')
  async getAllStaff(
    @Query('role') role?: Role,
    @Query('specialtyId') specialtyId?: string,
    @Query('serviceId') serviceId?: string
  ) {
    return this.staffService.getAllStaff(role, 
      specialtyId ? parseInt(specialtyId) : undefined, 
      serviceId ? parseInt(serviceId) : undefined 
    );
  }
}