import { Controller, Get, Query, HttpStatus, HttpCode, UseGuards } from '@nestjs/common';
import { StaffService } from './staff.service';
import { Role } from '@prisma/client/edge';
import { JwtGuard } from 'src/auth/jwt.guard';
import { RolesGuard } from 'src/auth/roles.guard';

@Controller('staff')
@UseGuards(JwtGuard)
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get('getAllStaff')
  @UseGuards(JwtGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  async getAllStaff(
    @Query('roles') roles?: string,
    @Query('specialtyId') specialtyId?: string,
    @Query('serviceId') serviceId?: string
  ) {

    const rolesArray = roles ? (roles.split(',') as Role[]) : undefined;

    // 2. On transforme la chaîne d'IDs en tableau de nombres [1, 3]
    const specialtyIdsArray = specialtyId 
      ? specialtyId.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
      : undefined;

    // 3. Idem pour les services
    const serviceIdsArray = serviceId 
      ? serviceId.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
      : undefined;

    return this.staffService.getAllStaff(rolesArray, 
      specialtyIdsArray, 
      serviceIdsArray
    );
  }
}