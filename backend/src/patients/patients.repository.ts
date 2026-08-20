import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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