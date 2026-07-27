import { Injectable } from "@nestjs/common/decorators/core/injectable.decorator";
import { PrismaService } from "src/prisma/prisma.service";

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
            },
        });

        // 5. Renvoyer le résultat enrichi des dates de début et fin de semaine
        return {
            weekStart: startOfWeek.toISOString().split('T')[0],
            weekEnd: endOfWeek.toISOString().split('T')[0],
            timeSlots,
        };
    }
}
