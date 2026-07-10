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

    searchPatientsByQuery(dto: SearchPatientsDto) {
        return this.prisma.user.findMany({
            where: {
                role: 'PATIENT',
                OR: [
                    { firstName: { contains: dto.q, mode: 'insensitive' } },
                    { lastName: { contains: dto.q, mode: 'insensitive' } },
                ],
            },
            orderBy: [
                { firstName: 'asc' },
                { lastName: 'asc' },
            ],
            take: dto.limit,
            include: {
                patient: true,
            },
        });
    }
}