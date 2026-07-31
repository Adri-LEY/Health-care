import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { AppointmentsRepository } from './appointments.repository';
import { AppointmentDto } from './dto/appointment.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { UsersRepository } from 'src/users/users.repository';

@Injectable()
export class AppointmentsService {

    constructor(
        private readonly appointmentsRepository: AppointmentsRepository,
        private readonly usersRepository: UsersRepository,
        private readonly mailerService: MailerService
    ) { }

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
     * Retrieves the schedule of a doctor for a given week.
     * @param doctorId - The ID of the doctor.
     * @param dateQuery - Optional date string to determine the week. If not provided, the current week is used.
     * @returns An object containing the start and end dates of the week, along with the scheduled appointments.
    */
    async getScheduleForDoctor(doctorId: number, dateQuery?: string) {
        return this.appointmentsRepository.getScheduleForDoctor(doctorId, dateQuery);
    }

    /**
     * Creates a new appointment for a patient with a specific doctor at a given time slot.
     * @param doctorId - The ID of the doctor.
     * @param patientId - The ID of the patient.
     * @param timeSlotId - The ID of the time slot.
     * @returns The created appointment.
     */
    async createAppointment(userId: number, patientId: number, appointmentDTO: AppointmentDto) {
        const appointmentExists = await this.appointmentsRepository.appointmentExists(patientId, appointmentDTO);
        if (appointmentExists) {
            throw new UnauthorizedException("Appointment already exists");
        }

        const user = await this.usersRepository.findUserById(userId);

        if (!user) {
            throw new UnauthorizedException("User not found");
        }
        const email = user.email;

        const appointment = await this.appointmentsRepository.createAppointment(patientId, appointmentDTO);

        if (appointment && email) {
            try {
                await this.mailerService.sendMail({
                    to: email,
                    subject: 'Confirmation de rendez-vous',
                    html: `<p>Bonjour ${user.firstName},</p>
                       <p>Votre rendez-vous a été confirmé avec succès.</p>
                       <p>Détails du rendez-vous :</p>
                          <ul>
                                <li>Médecin : ${appointment.doctor.staff.user.firstName} ${appointment.doctor.staff.user.lastName}</li>
                                <li>Spécialité : ${appointment.doctor.specialty.specialtyName}</li>
                                <li>Date : ${new Date(appointment.dateTime).toLocaleDateString()}</li>
                                <li>Heure : ${new Date(appointment.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</li>
                          </ul>
                          <p>Merci de votre confiance.</p>
                          <p>Cordialement,</p>
                            <p>L'équipe de la clinique</p>`,
                });
            } catch (error) {
                console.error("Error sending confirmation email:", error);
            }

            return appointment;
        }
    }

    /**
     * Cancel an appointment by its ID.
     * @param patientId - The ID of the patient.
     * @param appointmentId - The ID of the appointment to be canceled.
     * @returns The canceled appointment.
     * @throws Error if the appointment does not exist.
     */
    async cancelAppointment(userId: number, patientId: number, appointmentId: number) {
        const appointment = await this.appointmentsRepository.cancelAppointment(patientId, appointmentId);
        if (!appointment) {
            throw new BadRequestException("Appointment not found or does not belong to the patient");
        }

        const user = await this.usersRepository.findUserById(userId);

        if (!user) {
            throw new UnauthorizedException("User not found");
        }
        const email = user.email;

        if (appointment && email) {
            try {
                await this.mailerService.sendMail({
                    to: email,
                    subject: 'Annulation de rendez-vous',
                    html: `<p>Bonjour ${user.firstName},</p>
                     <p>Votre rendez-vous a été annulé avec succès.</p>
                        <p>Détails du rendez-vous annulé :</p>
                        <ul>
                            <li>Médecin : ${appointment.doctor.staff.user.firstName} ${appointment.doctor.staff.user.lastName}</li>
                            <li>Spécialité : ${appointment.doctor.specialty.specialtyName}</li>
                            <li>Date : ${new Date(appointment.dateTime).toLocaleDateString()}</li>
                            <li>Heure : ${new Date(appointment.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</li>
                        </ul>
                        <p>Merci de votre confiance.</p>
                        <p>Cordialement,</p>
                        <p>L'équipe de la clinique</p>`,
                });
            } catch (error) {
                console.error("Error sending cancellation email:", error);
            }
        }
        return appointment;
    }

    /**
     * Retrieves all appointments for a specific patient.
     * @param patientId - The ID of the patient.
     * @returns An array of appointments for the patient.
     * @throws BadRequestException if no appointments are found for the patient.
     */
    getAppointmentsByPatientId(patientId: number) {
        const appointments = this.appointmentsRepository.getAppointmentsByPatientId(patientId);

        if (!appointments) {
            throw new BadRequestException("No appointments found for the patient");
        }

        return appointments;
    }

    /**
     * Sets the presence status of an appointment.
     * @param appointmentId - The ID of the appointment.
     * @param isPresent - A boolean indicating if the patient was present (true) or absent (false).
     * @returns The updated appointment with the new presence status.
     * @throws BadRequestException if the appointment does not exist.
     */
    setAppointmentPresence(appointmentId: number, isPresent: boolean) {
        const result = this.appointmentsRepository.setAppointmentPresence(appointmentId, isPresent);

        if (!result) {
            throw new BadRequestException("Appointment not found");
        }

        return result;
    }
}
