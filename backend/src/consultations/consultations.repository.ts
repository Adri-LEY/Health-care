import { Injectable } from "@nestjs/common/decorators/core/injectable.decorator";
import { PrismaService } from "src/prisma/prisma.service";
import { ConsultationSummaryDto } from "./dto/consultation.dto";
import { ConflictException } from "@nestjs/common/exceptions/conflict.exception";
import { RiskClass } from "@prisma/client";

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
        console.log("consultationSummaryDto.biometricMeasures:", consultationSummaryDto.biometricMeasures);

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
                } : undefined,
                aiAnalysis: consultationSummaryDto.aiPredictionResult ? {
                    create: {
                        riskScore: consultationSummaryDto.aiPredictionResult.riskScore,
                        riskClass: consultationSummaryDto.aiPredictionResult.riskClass as RiskClass,
                        analysisDate: new Date(),
                        message: consultationSummaryDto.aiPredictionResult.message
                    }
                } : undefined
            },
            select: {
                id: true,
                date: true,
            }
        });
    }

    async getConsultationsStatsEvolution(doctorId: number) {
        const consultationsStats = await this.prisma.$queryRaw`
            SELECT
                DATE_TRUNC('month', "date") AS month,
                COUNT(*)::INTEGER AS total_consultations
            FROM "Consultation" c
            JOIN "MedicalRecord" mr ON c."medicalRecordId" = mr.id
            JOIN "Patient" p ON p."medicalRecordId" = mr.id
            WHERE p."doctorId" = ${doctorId}
            GROUP BY month
            ORDER BY month;
        `;

        return consultationsStats;
    }


    async getRecentConsultations(doctorId: number, recentNumber: number) {
        const consultations = await this.prisma.consultation.findMany({
            where: {
                medicalRecord: {
                    patient: {
                        doctorId: doctorId
                    }
                }
            },
            orderBy: {
                date: 'desc'
            },
            take: recentNumber,
            select: {
                id: true,
                date: true,
                visitReason: true,
                medicalRecord: {
                    select: {
                        patient: {
                            select: {
                                user: {
                                    select: {
                                        firstName: true,
                                        lastName: true,
                                        email: true,
                                        phone: true
                                    }
                                }
                            }
                        }
                    }
                },
                aiAnalysis: {
                    select: {
                        riskScore: true,
                        riskClass: true,
                    }
                }
            }
        });

        return consultations;
    }
}