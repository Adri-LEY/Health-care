import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, ParseUUIDPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/jwt.guard';
import { UserStatusGuard } from 'src/auth/status.guard';
import { PatientsService } from './patients.service';
import { SearchPatientsDto } from './dto/searchPatients.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { PatientRecordOwnerGuard } from 'src/auth/patientRecordOwnerGuard';
import { ModifyMedicalRecordDto } from './dto/modifyMedicalRecord.dto';

@Controller('patients')
@UseGuards(JwtGuard, UserStatusGuard, RolesGuard) // Ajout du RoleGuard pour vérifier le rôle de l'utilisateur
export class PatientsController {

    constructor(private readonly patientsService: PatientsService) {}

    @Post('assignDoctor')
    @Roles('DOCTOR', 'ADMINISTRATOR') // Seuls les médecins et les administrateurs peuvent assigner un médecin à un patient
    @HttpCode(HttpStatus.OK)
    async assignDoctorToPatient(@Body() body: { patientId: number; doctorId: number }) {
        const { patientId, doctorId } = body;
        console.log(`Received request to assign doctor with ID ${doctorId} to patient with ID ${patientId}`);
        const result = await this.patientsService.assignDoctorToPatient(patientId, doctorId);

        return {
            message: `Doctor with ID ${doctorId} has been assigned to patient with ID ${patientId}`,
            data: result,
        };
    }   

    @Post('unassignDoctor')
    @Roles('DOCTOR', 'ADMINISTRATOR') // Seuls les médecins et les administrateurs peuvent désassigner un médecin d'un patient
    @HttpCode(HttpStatus.OK)
    async removeDoctorFromPatient(@Body() body: { patientId: number }, @Req() req) {
        const { patientId } = body;
        const loggedInUser = req.user; // Récupère l'ID de l'utilisateur connecté depuis le token JWT

        console.log(`Logged in user: `, loggedInUser);

        console.log(`Received request to remove doctor from patient with ID ${patientId}`);
        const result = await this.patientsService.removeDoctorFromPatient(patientId, loggedInUser);

        return {
            message: `Doctor has been removed from patient with ID ${patientId}`,
            data: result,
        };
    }

    @Get('searchPatients')
    @Roles('DOCTOR', 'NURSE_ASSISTANT', 'ADMINISTRATOR')
    @HttpCode(HttpStatus.OK)
    async searchPatientsByQuery(@Query() dto: SearchPatientsDto) {
        console.log(`Received request to search patients with query "${dto.q}" and limit ${dto.limit}`);
        const result = await this.patientsService.searchPatientsByQuery(dto);
        
        return {
            message: `Found patients matching query "${dto.q}"`,
            data: result,
        };
    }


    @Get('medicalRecord/:patientId')
    @Roles('DOCTOR', 'NURSE_ASSISTANT', 'PATIENT')
    @UseGuards(PatientRecordOwnerGuard) // Ajout du PatientRecordOwnerGuard pour vérifier la propriété du dossier médical
    @HttpCode(HttpStatus.OK)
    async getMedicalRecordByPatientId(
        @Param('patientId', ParseIntPipe) patientId: number,
    ) {
        console.log(`Received request to get medical record for patient with ID ${patientId}`);
        const result = await this.patientsService.getMedicalRecordWithProfileByPatientId(patientId);

        return {
            message: `Medical record for patient with ID ${patientId}`,
            data: result,
        };
    }

    @Post(':patientId/vitals')
    @Roles('DOCTOR', 'NURSE_ASSISTANT')
    @HttpCode(HttpStatus.OK)
    async modifyMedicalRecord(
        @Param('patientId', ParseIntPipe) patientId: number,
        @Body() data: ModifyMedicalRecordDto
    ) {
        console.log(`Received request to modify medical record for patient with ID ${patientId}`);
        const result = await this.patientsService.modifyMedicalRecord(patientId, data);
        return {
            message: `Medical record for patient with ID ${patientId} has been updated`,
            data: result,
        };
    }


    @Get(':patientId/profile')
    @Roles('ADMINISTRATOR')
    @HttpCode(HttpStatus.OK)
    async getPatientProfile(
        @Param('patientId', ParseIntPipe) patientId: number
    ) {
        console.log(`Received request to get profile for patient with ID ${patientId}`);
        const result = await this.patientsService.getPatientProfile(patientId);
        return {
            message: `Profile for patient with ID ${patientId}`,
            data: result,
        };
    }
}