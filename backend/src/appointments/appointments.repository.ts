import { Injectable } from "@nestjs/common/decorators/core/injectable.decorator";
import { PrismaService } from "src/prisma/prisma.service";
import { AppointmentDto } from "./dto/appointment.dto";
import { start } from "repl";
import { AppointmentStatus } from "@prisma/client/edge";

@Injectable()
export class AppointmentsRepository {
    constructor(private readonly prisma: PrismaService) { }


    async getDoctorAvailabilities(doctorId: number, dateQuery?: string) {
        const baseDate = dateQuery ? new Date(dateQuery) : new Date();

        // 2. Calculer le Lundi de la semaine en cours (00:00:00)
        const startOfWeek = new Date(baseDate);
        const dayOfWeek = startOfWeek.getUTCDay(); // 0 = Dimanche, 1 = Lundi, ...
        const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        startOfWeek.setUTCDate(startOfWeek.getUTCDate() + distanceToMonday);
        startOfWeek.setUTCHours(0, 0, 0, 0);

        // 3. Calculer le Dimanche de cette semaine (23:59:59)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setUTCDate(endOfWeek.getUTCDate() + 6);
        endOfWeek.setUTCHours(23, 59, 59, 999);

        const now = new Date();
        const localNow = new Date(now.getTime() + (1 * 60 * 60 * 1000));

        //console.log("now", now);
        //console.log("localNow", localNow);

        // 4. Requête Prisma : Récupérer les créneaux de la semaine
        const timeSlots = await this.prisma.timeSlot.findMany({
            where: {
                date: {
                    gte: startOfWeek,
                    lte: endOfWeek,
                },
                startTime: {
                    gte: localNow.toISOString(),
                },
                endTime: {
                    gte: localNow.toISOString(),
                },
                isLocked: false, // Créneau non verrouillée
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

        //console.log(`Time slots for doctor ${doctorId} between ${startOfWeek.toISOString()} and ${endOfWeek.toISOString()}:`, timeSlots);

        // 5. Renvoyer le résultat enrichi des dates de début et fin de semaine
        return {
            weekStart: startOfWeek.toISOString().split('T')[0],
            weekEnd: endOfWeek.toISOString().split('T')[0],
            timeSlots,
        };
    }

    async getScheduleForDoctor(doctorId: number, dateQuery?: string) {
        let baseDate = dateQuery ? new Date(dateQuery) : new Date();
        if (dateQuery && dateQuery !== 'undefined' && dateQuery !== 'null') {
            const parsedDate = new Date(dateQuery);
            // On vérifie si la Date est valide en testant isNaN(parsedDate.getTime())
            if (!isNaN(parsedDate.getTime())) {
                baseDate = parsedDate;
            }
        }

        // 2. Calculer le Lundi de la semaine en cours (00:00:00)
        const startOfWeek = new Date(baseDate);
        const dayOfWeek = startOfWeek.getUTCDay(); // 0 = Dimanche, 1 = Lundi, ...
        const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        startOfWeek.setUTCDate(startOfWeek.getUTCDate() + distanceToMonday);
        startOfWeek.setUTCHours(0, 0, 0, 0);

        // 3. Calculer le Dimanche de cette semaine (23:59:59)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setUTCDate(endOfWeek.getUTCDate() + 6);
        endOfWeek.setUTCHours(23, 59, 59, 999);

        // 4. Requête Prisma : Récupérer les rendez-vous de la semaine pour le médecin
        const appointments = await this.prisma.appointment.findMany({
            where: {
                doctorId: doctorId,
                dateTime: {
                    gte: startOfWeek,
                    lte: endOfWeek,
                },
                status: { in: ['SCHEDULED', 'CONFIRMED', 'MISSED'] },
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
                        id: true,
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

    async isTimeSlotBookedForDoctor(doctorId: number, timeSlotId: number) {
        const appointment = await this.prisma.appointment.findFirst({
            where: {
                doctorId,
                timeSlotId,
                status: { in: ['SCHEDULED', 'CONFIRMED'] },
            },
            select: { id: true },
        });

        return appointment !== null;
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

        if (!timeSlot) {
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
            select: {
                id: true,
                dateTime: true,
                status: true,
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
                        specialty: {
                            select: {
                                specialtyName: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async cancelAppointment(patientId: number, appointmentId: number) {
        const result = await this.prisma.appointment.update({
            where: { id: appointmentId, patientId },
            data: { status: 'CANCELLED' },
            select: {
                id: true,
                dateTime: true,
                status: true,
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
                        specialty: {
                            select: {
                                specialtyName: true,
                            },
                        },
                    },
                },
            }
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


    setAppointmentPresence(appointmentId: number, isPresent: boolean) {
        console.log(`Setting presence for appointment ${appointmentId} to ${isPresent}`);

        return this.prisma.appointment.update({
            where: { id: appointmentId },
            data: {
                status: isPresent === true ? AppointmentStatus.CONFIRMED : AppointmentStatus.MISSED
            },
        });
    }

    async getAllDoctorsInformation() {
        let response= {};

        const doctors = await this.prisma.doctor.findMany({
            select: {
                id: true,
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
                specialty: {
                    select: {
                        specialtyName: true,
                    },
                },
            },
        });


        for (const doctor of doctors) {
            const availabilities = await this.getDoctorAvailabilities(doctor.id);

            response[doctor.id] = {
                doctorId: doctor.id,
                firstName: doctor.staff.user.firstName,
                lastName: doctor.staff.user.lastName,
                email: doctor.staff.user.email,
                phone: doctor.staff.user.phone,
                specialty: doctor.specialty.specialtyName,
                availabilities: availabilities.timeSlots || [],
            };
        }

        console.log("All doctors information with availabilities:", response);

        return response;
    }
}
