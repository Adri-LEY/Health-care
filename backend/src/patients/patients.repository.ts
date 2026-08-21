import { Injectable } from '@nestjs/common';
import { Prisma, RiskClass } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { SearchPatientsDto } from './dto/searchPatients.dto';


type PatientsStatsQuery = {
    total: bigint;
    under18: bigint;
    from18to30: bigint;
    from31to45: bigint;
    from46to60: bigint;
    over60: bigint;
    male: bigint;
    female: bigint;
    intern: bigint;
    extern: bigint;
};

@Injectable()
export class PatientsRepository {
    constructor(private readonly prisma: PrismaService) { }

    findPatientById(patientId: number) {
        return this.prisma.patient.findUnique({
            where: { id: patientId },
        });
    }

    getMedicalRecordIdByPatientId(patientId: number) {
        return this.prisma.patient.findUnique({
            where: { id: patientId },
            select: { medicalRecordId: true },
        });
    }

    getMedicalRecordByPatientId(patientId: number) {
        return this.prisma.patient.findUnique({
            where: { id: patientId },
            select: { medicalRecord: true },
        });
    }

    async getPatientsStats() {
        const result = await this.prisma.$queryRaw<PatientsStatsQuery[]>`
        SELECT
            COUNT(*) AS total,

            -- Age groups
            COUNT(*) FILTER (WHERE age < 18) AS under18,
            COUNT(*) FILTER (WHERE age BETWEEN 18 AND 30) AS from18to30,
            COUNT(*) FILTER (WHERE age BETWEEN 31 AND 45) AS from31to45,
            COUNT(*) FILTER (WHERE age BETWEEN 46 AND 60) AS from46to60,
            COUNT(*) FILTER (WHERE age > 60) AS over60,

            -- Gender groups
            COUNT(*) FILTER (WHERE gender = 'M') AS male,
            COUNT(*) FILTER (WHERE gender = 'F') AS female,

            -- Intern/Extern group
            COUNT(*) FILTER (WHERE intern = true) AS intern,
            COUNT(*) FILTER (WHERE intern = false) AS extern

        FROM "Patient";
    `;

        return result;
    }


    async getTotalPatientsAssignedToDoctor(doctorId: number) {
        if (!doctorId) {
            throw new Error("Doctor ID is required to fetch patients assigned to the doctor.");
        }

        const count = await this.prisma.patient.count({
            where: { doctorId },
        });
        return count;
    }

    /*async getRiskDistributionOfPatientsAssignedToDoctor(doctorId: number) {
        const result: { lowRisk: string; moderateRisk: string; highRisk: string }[] = await this.prisma.$queryRaw`
            SELECT
                COUNT(DISTINCT p.id) FILTER (WHERE ai."riskClass" = ${RiskClass.Low}::"RiskClass") AS "lowRisk",
                COUNT(DISTINCT p.id) FILTER (WHERE ai."riskClass" = ${RiskClass.Moderate}::"RiskClass") AS "moderateRisk",
                COUNT(DISTINCT p.id) FILTER (WHERE ai."riskClass" = ${RiskClass.High}::"RiskClass") AS "highRisk"
            FROM "Patient" p
            LEFT JOIN "MedicalRecord" mr ON p."medicalRecordId" = mr.id
            LEFT JOIN "Consultation" c ON mr.id = c."medicalRecordId"
            LEFT JOIN "CardiologyAiAnalysis" ai ON c.id = ai."consultationId"
            WHERE p."doctorId" = ${doctorId};
        `;

        const highRiskList = await this.prisma.$queryRaw`
            SELECT DISTINCT p.id, u."firstName", u."lastName", u.email, u.phone
            FROM "Patient" p
            LEFT JOIN "MedicalRecord" mr ON p."medicalRecordId" = mr.id
            LEFT JOIN "Consultation" c ON mr.id = c."medicalRecordId"
            LEFT JOIN "CardiologyAiAnalysis" ai ON c.id = ai."consultationId"
            LEFT JOIN "User" u ON p."userId" = u.id
            WHERE p."doctorId" = ${doctorId} AND ai."riskClass" = ${RiskClass.High}::"RiskClass";
        `;

        return {
            lowRisk: Number(result[0].lowRisk),
            moderateRisk: Number(result[0].moderateRisk),
            highRisk: Number(result[0].highRisk),
            highRiskList: highRiskList.map((row: any) => ({
                id: row.id,
                firstName: row.firstName,
                lastName: row.lastName,
                email: row.email,
                phone: row.phone
            }))
        };
    }*/

    async getRiskDistributionOfPatientsAssignedToDoctor(doctorId: number) {
        // 1. Récupérer tous les patients rattachés au médecin avec leur TOUTE DERNIÈRE consultation
        const patients = await this.prisma.patient.findMany({
            where: { doctorId: doctorId },
            select: {
                id: true,
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                    },
                },
                medicalRecord: {
                    select: {
                        id: true,
                        consultations: {
                            take: 1,
                            orderBy: { date: 'desc' },
                            select: {
                                aiAnalysis: {
                                    select: {
                                        riskClass: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        // 2. Initialiser le compteur de distribution
        const riskDistribution = {
            low: 0,
            moderate: 0,
            high: 0,
            unassessed: 0,
        };

        const highRiskList: { id: number; firstName: string; lastName: string; email: string; phone: string; medicalRecordId: number | null; }[] = [];

        // 3. Parcourir les patients et compter selon la classe de leur DERNIÈRE analyse
        patients.forEach((patient) => {
            const latestConsultation = patient.medicalRecord?.consultations[0];
            const riskClass = latestConsultation?.aiAnalysis?.riskClass;

            switch (riskClass) {
                case 'Low':
                    riskDistribution.low += 1;
                    break;
                case 'Moderate':
                    riskDistribution.moderate += 1;
                    break;
                case 'High':
                    riskDistribution.high += 1;
                    highRiskList.push({
                        id: patient.id,
                        firstName: patient.user.firstName,
                        lastName: patient.user.lastName,
                        email: patient.user.email,
                        phone: patient.user.phone ?? '',
                        medicalRecordId: patient.medicalRecord?.id ?? null,
                    });
                    break;
                default:
                    // Si le patient n'a pas encore de consultation ou pas d'analyse IA
                    riskDistribution.unassessed += 1;
                    break;
            }
        });

        return {riskDistribution, highRiskList};
    };


    assignDoctorToPatient(patientId: number, doctorId: number) {
        return this.prisma.patient.update({
            where: { id: patientId },
            data: { doctorId },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                    },
                }
            },
        });
    }


    removeDoctorFromPatient(patientId: number) {
        return this.prisma.patient.update({
            where: { id: patientId },
            data: { doctorId: null },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                    },
                }
            },
        });
    }

    searchPatientsByQuery(whereCondition: Prisma.UserWhereInput, limit?: number) {
        return this.prisma.user.findMany({
            where: whereCondition,
            orderBy: [
                { firstName: 'asc' },
                { lastName: 'asc' },
            ],
            take: limit,
            include: {
                patient: true,
            },
        });
    }

    getMedicalRecordWithProfileByPatientId(patientId: number) {
        return this.prisma.patient.findUnique({
            where: { id: patientId },
            include: {
                medicalRecord: true,
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                    },
                },
                doctor: {
                    select: {
                        id: true,
                        staff: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        firstName: true,
                                        lastName: true,
                                        email: true,
                                        phone: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
    }


    getPatientProfileByPatientId(patientId: number) {
        return this.prisma.patient.findUnique({
            where: { id: patientId },
            select: {
                id: true,
                age: true,
                gender: true,
                birthDate: true,
                address: true,
                intern: true,
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                    },
                },
                doctor: {
                    select: {
                        id: true,
                        staff: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        firstName: true,
                                        lastName: true,
                                        email: true,
                                        phone: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
    }
}