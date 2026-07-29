import { Injectable } from "@nestjs/common/decorators/core/injectable.decorator";
import { PrismaService } from "src/prisma/prisma.service";
import { AppointmentDto } from "./dto/appointment.dto";

@Injectable()
export class AppointmentsRepository {
    constructor(private readonly prisma: PrismaService) { }


    async getDoctorAvailabilities(doctorId: number, dateQuery?: string) {
        const baseDate = dateQuery ? new Date(dateQuery) : new Date();

        // 2. Calculer le Lundi de la semaine en cours (00:00:00)
        const startOfWeek = new Date(baseDate);
        const dayOfWeek = startOfWeek.getDay(); // 0 = Dimanche, 1 = Lundi, ...
        const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        startOfWeek.setDate(startOfWeek.getDate() + distanceToMonday);
        startOfWeek.setHours(0, 0, 0, 0);

        // 3. Calculer le Dimanche de cette semaine (23:59:59)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        // 4. Requête Prisma : Récupérer les créneaux de la semaine
        const timeSlots = await this.prisma.timeSlot.findMany({
            where: {
                date: {
                    gte: startOfWeek,
                    lte: endOfWeek,
                },
                isLocked: false, // Créneau non verrouillée
                startTime: {
                    gte: baseDate,
                },
                endTime: {
                    gte: baseDate,
                },
                appointments: {
                    none: {
                        doctorId: doctorId,
                        status: { in: ['SCHEDULED', 'CONFIRMED'] }, // Pas de RDV actif dessus
                    },
                },
            },
            orderBy: [
                { date: 'asc' },
                { startTime: 'asc' },
            ],
            select: {
                id: true,
                date: true,
                startTime: true,
                endTime: true,
                isLocked: true,
            },
        });

        // 5. Renvoyer le résultat enrichi des dates de début et fin de semaine
        return {
            weekStart: startOfWeek.toISOString().split('T')[0],
            weekEnd: endOfWeek.toISOString().split('T')[0],
            timeSlots,
        };
    }

    async getScheduleForDoctor(doctorId: number, dateQuery?: string) {
        const baseDate = dateQuery ? new Date(dateQuery) : new Date();

        // 2. Calculer le Lundi de la semaine en cours (00:00:00)
        const startOfWeek = new Date(baseDate);
        const dayOfWeek = startOfWeek.getDay(); // 0 = Dimanche, 1 = Lundi, ...
        const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        startOfWeek.setDate(startOfWeek.getDate() + distanceToMonday);
        startOfWeek.setHours(0, 0, 0, 0);

        // 3. Calculer le Dimanche de cette semaine (23:59:59)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        // 4. Requête Prisma : Récupérer les rendez-vous de la semaine pour le médecin
        const appointments = await this.prisma.appointment.findMany({
            where: {
                doctorId: doctorId,
                dateTime: {
                    gte: startOfWeek,
                    lte: endOfWeek,
                },
            },
            orderBy: [
                { dateTime: 'asc' },
            ],
            select: {
                id: true,
                dateTime: true,
                status: true,
                patient: {
                    select: {
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
                timeSlot: {
                    select: {
                        id: true,
                        date: true,
                        startTime: true,
                        endTime: true,
                    },
                },
            },
        });

        return appointments;
    }


    async appointmentExists(patientId: number, appointmentDTO: AppointmentDto) {
        const appointmentExists = await this.prisma.appointment.findFirst({
            where: {
                doctorId: appointmentDTO.doctorId,
                patientId: patientId,
                timeSlotId: appointmentDTO.timeSlotId,
                status: { in: ['SCHEDULED', 'CONFIRMED'] },
            },
        });

        return appointmentExists !== null;
    }

    async createAppointment(patientId: number, appointmentDTO: AppointmentDto) {
        const timeSlot = await this.prisma.timeSlot.findUnique({
            where: { id: appointmentDTO.timeSlotId },
            select: {
                date: true,
                startTime: true,
                endTime: true,
            },
        });

        if(!timeSlot) {
            throw new Error("Time slot not found");
        }

        return await this.prisma.appointment.create({
            data: {
                dateTime: timeSlot.date,
                doctorId: appointmentDTO.doctorId,
                patientId: patientId,
                timeSlotId: appointmentDTO.timeSlotId,
                status: 'SCHEDULED',
            },
        });
    }

    async cancelAppointment(patientId: number, appointmentId: number) {
        const result = await this.prisma.appointment.update({
            where: { id: appointmentId, patientId },
            data: { status: 'CANCELLED' },
        });
        return result;
    }

    getAppointmentsByPatientId(patientId: number) {
        return this.prisma.appointment.findMany({
            where: { patientId },
            select: {
                id: true,
                dateTime: true,
                status: true,
                doctor: {
                    select: {
                        staff: {
                            select: {
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
                timeSlot: {
                    select: {
                        id: true,
                        date: true,
                        startTime: true,
                        endTime: true,
                    },
                },
            },
        });
    }
}
