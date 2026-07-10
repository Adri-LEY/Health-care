import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/jwt.guard';
import { UserStatusGuard } from 'src/auth/status.guard';
import { PatientsService } from './patients.service';

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
}
