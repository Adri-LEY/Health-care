import { Injectable } from '@nestjs/common';
import { AppointmentsRepository } from './appointments.repository';

@Injectable()
export class AppointmentsService {

    constructor(private readonly appointmentsRepository: AppointmentsRepository) {}

    /**
     * Retrieves the availabilities of a doctor for a given week.
     * @param doctorId - The ID of the doctor.
     * @param dateQuery - Optional date string to determine the week. If not provided, the current week is used.
     * @returns An object containing the start and end dates of the week, along with the available time slots.
     */
    async getDoctorAvailabilities(doctorId: number, dateQuery?: string) {
        return this.appointmentsRepository.getDoctorAvailabilities(doctorId, dateQuery);
    }

}
