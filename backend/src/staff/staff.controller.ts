import { Controller, Get, Query, HttpStatus, HttpCode, UseGuards, Post, Body, ParseIntPipe, Param } from '@nestjs/common';
import { StaffService } from './staff.service';
import { Role, UserStatus } from '@prisma/client';
import { JwtGuard } from 'src/auth/jwt.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { NewStaffMemberDto } from './dto/newStaffMember.dto';
import { ActivateStaffAccountDto } from './dto/activateStaffAccount.dto';
import { UpdateStaffMemberStatusDto } from './dto/updateStaffMemberStatus.dto';
import { ResendActivationTokenDto } from './dto/resendActivationToken.dto';
import { AssignStaffMemberDto } from './dto/assignStaffMember.dto';
import { Roles } from 'src/auth/roles.decorator';
import { UserStatusGuard } from 'src/auth/status.guard';

//@UseGuards(JwtGuard)
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get('getAllStaff')
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

  @Post('createNewStaffMember')
  @UseGuards(RolesGuard)
  @Roles('ADMINISTRATOR') // Seul un administrateur peut créer un nouveau membre du personnel
  @HttpCode(HttpStatus.CREATED)
  async createNewStaffMember(@Body() newStaffMemberDto: NewStaffMemberDto) {
    return await this.staffService.createNewStaffMember(newStaffMemberDto);
  }

  @Post('activateStaffMember')
  @UseGuards(RolesGuard)
  @Roles('ADMINISTRATOR') // Seul un administrateur peut activer un membre du personnel
  @HttpCode(HttpStatus.OK)
  async activateStaffMember(@Body() activateNewStaffAccountDto: ActivateStaffAccountDto) {
    return await this.staffService.activateStaffMember(activateNewStaffAccountDto);
  }

  @Post('updateStaffMemberStatus')
  @UseGuards(RolesGuard)
  @Roles('ADMINISTRATOR') // Seul un administrateur peut mettre à jour le statut d'un membre du personnel
  @HttpCode(HttpStatus.OK)
  async updateStaffMemberStatus(@Body() updateStaffMemberStatusDto: UpdateStaffMemberStatusDto) {
    return await this.staffService.updateStaffMemberStatus(updateStaffMemberStatusDto);
  }

  @Post('resendActivationToken')
  @UseGuards(RolesGuard)
  @Roles('ADMINISTRATOR') // Seul un administrateur peut renvoyer un token d'activation
  @HttpCode(HttpStatus.OK)
  async resendStaffActivationToken(@Body() resendActivationTokenDto: ResendActivationTokenDto) {
    return await this.staffService.resendStaffActivationToken(resendActivationTokenDto);
  }

  @Post('assignStaffMember')
  @UseGuards(RolesGuard)
  @Roles('ADMINISTRATOR') // Seul un administrateur peut assigner un membre du personnel
  @HttpCode(HttpStatus.OK)
  async assignStaffMember(@Body() assignStaffMemberDto: AssignStaffMemberDto) {
    return await this.staffService.setSpecialtyForDoctor(assignStaffMemberDto);
  }

  @Get('doctorProfile/:doctorId')
  //@UseGuards(RolesGuard, UserStatusGuard)
  @Roles('ADMINISTRATOR', 'PATIENT')
  @HttpCode(HttpStatus.OK)
  async getDoctorProfileById(@Param('doctorId', ParseIntPipe) doctorId: number) {
    return await this.staffService.getDoctorProfileById(doctorId);
  }
}