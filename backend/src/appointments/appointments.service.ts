import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { AppointmentsRepository } from './appointments.repository';
import { AppointmentDto } from './dto/appointment.dto';

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

    /**
     * Creates a new appointment for a patient with a specific doctor at a given time slot.
     * @param doctorId - The ID of the doctor.
     * @param patientId - The ID of the patient.
     * @param timeSlotId - The ID of the time slot.
     * @returns The created appointment.
     */
    async createAppointment(patientId: number, appointmentDTO : AppointmentDto) {
        const appointmentExists = await this.appointmentsRepository.appointmentExists(patientId, appointmentDTO);
        if (appointmentExists) {
            throw new UnauthorizedException("Appointment already exists");
        }

        return this.appointmentsRepository.createAppointment(patientId, appointmentDTO);
    }

    /**
     * Cancel an appointment by its ID.
     * @param patientId - The ID of the patient.
     * @param appointmentId - The ID of the appointment to be canceled.
     * @returns The canceled appointment.
     * @throws Error if the appointment does not exist.
     */
    async cancelAppointment(patientId: number, appointmentId: number) {
        const appointment = await this.appointmentsRepository.cancelAppointment(patientId, appointmentId);
        if (!appointment) {
            throw new BadRequestException("Appointment not found or does not belong to the patient");
        }
        return appointment;
    }

    /**
     * Retrieves all appointments for a specific patient.
     * @param patientId - The ID of the patient.
     * @returns An array of appointments for the patient.
     */
    getAppointmentsByPatientId(patientId: number) {
        return this.appointmentsRepository.getAppointmentsByPatientId(patientId);
    }
}
