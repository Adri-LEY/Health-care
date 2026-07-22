import { Injectable } from "@nestjs/common/decorators/core/injectable.decorator";
import { PrismaService } from "src/prisma/prisma.service";
import { ConsultationSummaryDto } from "./dto/consultation.dto";
import { ConflictException } from "@nestjs/common/exceptions/conflict.exception";

@Injectable()
export default class ConsultationsRepository {

    constructor(private readonly prisma: PrismaService) { }

    async getAllConsultations(medicalRecordId: number) {
        return await this.prisma.consultation.findMany({
            where: { medicalRecordId },
            select: {
                id: true,
                date: true,
                visitReason: true,
            },
            orderBy: { date: 'desc' },
        });
    }

    async getConsultationById(consultationId: number) {
        return await this.prisma.consultation.findUnique({
            where: { id: consultationId },
            select: {
                id: true,
                date: true,
                visitReason: true,
                observations: true,
                biometricMeasures: true,
                aiAnalysis: true,
                prescription: {
                    select: {
                        id: true,
                        prescriptionDate: true,
                        prescriptionItems: true
                    },
                },
            },
        });
    }

    async saveNewConsultation(consultationSummaryDto: ConsultationSummaryDto) {
        return await this.prisma.consultation.create({
            data: {
                date: consultationSummaryDto.date,
                visitReason: consultationSummaryDto.visitReason,
                observations: consultationSummaryDto.observations,
                biometricMeasures: consultationSummaryDto.biometricMeasures ? JSON.stringify(consultationSummaryDto.biometricMeasures) : "",
                medicalRecordId: consultationSummaryDto.medicalRecordId,
                prescription: consultationSummaryDto.prescription ? {
                    create: {
                        prescriptionDate: new Date(),
                        prescriptionItems: {
                            create: consultationSummaryDto.prescription.elements.map(item => ({
                                name: item.name,
                                description: item.description,
                                dosage: item.dosage,
                                duration: item.duration,
                                medicationId: item.medicationId,
                                equipmentId: item.equipmentId,
                                careId: item.careId
                            }))
                        }
                    }
                } : undefined
            }
        });
    }
}