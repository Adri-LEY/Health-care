import { Injectable } from "@nestjs/common/decorators/core/injectable.decorator";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export default class ConsultationsRepository {

    constructor(private readonly prisma: PrismaService) {}

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
}