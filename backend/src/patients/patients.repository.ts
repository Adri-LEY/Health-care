import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { SearchPatientsDto } from './dto/searchPatients.dto';


@Injectable()
export class PatientsRepository {
    constructor(private readonly prisma: PrismaService) {}

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