import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ConsultationsService } from './consultations.service';
import { RolesGuard } from 'src/auth/roles.guard';
import { JwtGuard } from 'src/auth/jwt.guard';
import { UserStatusGuard } from 'src/auth/status.guard';
import { Roles } from 'src/auth/roles.decorator';
import { ConsultationOwnerGuard } from 'src/auth/consultationOwnerGuard';
import { PatientRecordOwnerGuard } from 'src/auth/patientRecordOwnerGuard';
import { MedicalRecordAccessGuard } from 'src/auth/medicalRecordAccessGuard';
import { ConsultationSummaryDto } from './dto/consultation.dto';

@Controller('consultations')
@UseGuards(JwtGuard, UserStatusGuard, RolesGuard)
export class ConsultationsController {

    constructor(private readonly consultationsService: ConsultationsService) {}

    @Get('/history/:medicalRecordId')
    @Roles('DOCTOR', 'NURSE_ASSISTANT', 'PATIENT')
    @UseGuards(MedicalRecordAccessGuard)
    async getConsultationsHistory(
        @Param('medicalRecordId') medicalRecordId: string,
    ): Promise<any> {
        return await this.consultationsService.getConsultationsHistory(medicalRecordId);
    }

    @Get('/consultation-details/:consultationId')
    @Roles('DOCTOR', 'NURSE_ASSISTANT', 'PATIENT')
    //@UseGuards(ConsultationOwnerGuard)
    async getconsultationDetails(@Param('consultationId') consultationId: string): Promise<any> {
        return await this.consultationsService.getconsultationDetails(consultationId);
    }

    @Post('/save-consultation')
    @Roles('DOCTOR', 'NURSE_ASSISTANT')
    async saveNewConsultation(@Body() consultationSummaryDto: ConsultationSummaryDto): Promise<any> {
        return await this.consultationsService.saveNewConsultation(consultationSummaryDto);
    }
}
