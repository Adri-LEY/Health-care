import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/jwt.guard';
import { UserStatusGuard } from 'src/auth/status.guard';
import { PatientsService } from './patients.service';
import { SearchPatientsDto } from './dto/searchPatients.dto';

@Controller('patients')
export class PatientsController {

    constructor(private readonly patientsService: PatientsService) {}

    @Post('assignDoctor')
    //@UseGuards(JwtGuard, UserStatusGuard)
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

    @Post('removeDoctor')
    //@UseGuards(JwtGuard, UserStatusGuard)
    @HttpCode(HttpStatus.OK)
    async removeDoctorFromPatient(@Body() body: { patientId: number }) {
        const { patientId } = body;
        console.log(`Received request to remove doctor from patient with ID ${patientId}`);
        const result = await this.patientsService.removeDoctorFromPatient(patientId);

        return {
            message: `Doctor has been removed from patient with ID ${patientId}`,
            data: result,
        };
    }

    @Get('searchPatients')
    //@UseGuards(JwtGuard, UserStatusGuard)
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
    //@UseGuards(JwtGuard, UserStatusGuard)
    @HttpCode(HttpStatus.OK)
    async getMedicalRecordByPatientId(@Param('patientId', ParseIntPipe) patientId: number) {
        console.log(`Received request to get medical record for patient with ID ${patientId}`);
        const result = await this.patientsService.getMedicalRecordWithProfileByPatientId(patientId);

        return {
            message: `Medical record for patient with ID ${patientId}`,
            data: result,
        };
    }
}