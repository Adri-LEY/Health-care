import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { BiometricsService } from './biometrics.service';
import { CreateBiometricMeasuresDto } from './dto/createBiometricMeasure.dto';
import { MeasurementType } from '@prisma/client';
import { LinkBiometricsToConsultationDto } from './dto/linkBiometricsToConsultation.dto';

@Controller('biometrics')
export class BiometricsController {

    constructor(private readonly biometrics: BiometricsService) { }

    @Post('/:nurseAssistantId/add-measures')
    async addBiometricMeasures(
        @Param('nurseAssistantId', ParseIntPipe) nurseAssistantId: number,
        @Body() createBiometricMeasuresDto: CreateBiometricMeasuresDto,
    ): Promise<any> {
        return await this.biometrics.addMeasures(createBiometricMeasuresDto, nurseAssistantId);
    }

    @Get('/history/:medicalRecordId')
    async getBiometricHistory(
        @Param('medicalRecordId', ParseIntPipe) medicalRecordId: number,
        @Query('type') type?: MeasurementType,
    ): Promise<any> {
        return await this.biometrics.getHistory(medicalRecordId, type);
    }

    @Get('/recent/:medicalRecordId')
    async getRecentBiometrics(
        @Param('medicalRecordId', ParseIntPipe) medicalRecordId: number,
    ): Promise<any> {
        return await this.biometrics.getRecentBiometricsWithinTwoHours(medicalRecordId);
    }

    @Patch('/link-consultation/:consultationId')
    async linkBiometricsToConsultation(
        @Param('consultationId', ParseIntPipe) consultationId: number,
        @Body() dto: LinkBiometricsToConsultationDto,
    ): Promise<any> {
        return await this.biometrics.linkMeasuresToConsultation(
            consultationId,
            dto.biometricIds,
        );
    }
}
