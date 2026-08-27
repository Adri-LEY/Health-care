import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentDto } from './dto/appointment.dto';
import { JwtGuard } from 'src/auth/jwt.guard';
import { UserStatusGuard } from 'src/auth/status.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'generated/prisma';


@UseGuards(JwtGuard, UserStatusGuard, RolesGuard) // Ajout du JwtGuard pour sécuriser les routes
@Controller('appointments')
export class AppointmentsController {

    constructor(private readonly appointmentsService: AppointmentsService) { }

    @Roles('PATIENT') // Seuls les patients, les assistants médicaux, les médecins et les administrateurs peuvent accéder à cette route
    @Get('/doctor/:doctorId/availabilities')
    async getDoctorAvailabilities(
        @Param('doctorId', ParseIntPipe) doctorId: number,
        @Query('date') dateQuery?: string
    ) {
        return await this.appointmentsService.getDoctorAvailabilities(doctorId, dateQuery);
    }

    @Roles('DOCTOR', 'NURSE_ASSISTANT', 'ADMINISTRATOR') // Seuls les médecins, les assistants médicaux et les administrateurs peuvent accéder à cette route
    @Get('/doctor/:doctorId/schedule')
    async getScheduleForDoctor(
        @Param('doctorId', ParseIntPipe) doctorId: number,
        @Query('date') dateQuery?: string
    ) {
        return await this.appointmentsService.getScheduleForDoctor(doctorId, dateQuery);
    }

    @Roles('PATIENT')
    @Post('/create-appointment')
    async createAppointment(
        @Req() req,
        @Body() appointmentDTO : AppointmentDto
    ) {
        const loggedInUser = req.user; // Récupère l'ID de l'utilisateur connecté depuis le token JWT

        console.log(`Logged in user: `, loggedInUser);
        
        const userIdFromToken = loggedInUser.id; // Récupère l'ID de l'utilisateur depuis le token JWT
        const patientIdFromToken = loggedInUser.patientId; // Récupère l'ID du patient depuis le token JWT

        console.log(`Creating appointment for patient ID: ${patientIdFromToken} with data: `, appointmentDTO);

        return await this.appointmentsService.createAppointment(userIdFromToken, patientIdFromToken, appointmentDTO);
    }

    @Roles('PATIENT')
    @Post('/cancel-appointment/:appointmentId')
    async cancelAppointment(
        @Req() req,
        @Param('appointmentId', ParseIntPipe) appointmentId: number
    ) {
        const loggedInUser = req.user; // Récupère l'ID de l'utilisateur connecté depuis le token JWT
        const patientIdFromToken = loggedInUser.patientId; // Récupère l'ID du patient depuis le token JWT
        const userIdFromToken = loggedInUser.id; // Récupère l'ID de l'utilisateur depuis le token JWT

        return await this.appointmentsService.cancelAppointment(userIdFromToken, patientIdFromToken, appointmentId);
    }

    @Roles('PATIENT')
    @Get('/patient-appointments')
    async getAppointmentsByPatientId(
        @Req() req,
    ) {
        const loggedInUser = req.user; // Récupère l'ID de l'utilisateur connecté depuis le token JWT
        const patientIdFromToken = loggedInUser.patientId; // Récupère l'ID du patient depuis le token JWT

        return await this.appointmentsService.getAppointmentsByPatientId(patientIdFromToken);
    }

    @Roles('PATIENT')
    @Get('/patient-appointments/stats')
    async getPatientAppointmentStats(@Req() req) {
        const patientIdFromToken = req.user.patientId;

        return await this.appointmentsService.getPatientAppointmentStats(patientIdFromToken);
    }


    @Roles('NURSE_ASSISTANT')
    @Post('/set-appointment-presence/:appointmentId')
    async setAppointmentPresence(
        @Param('appointmentId', ParseIntPipe) appointmentId: number,
        @Body('isPresent') isPresent: boolean
    ) {
        return await this.appointmentsService.setAppointmentPresence(appointmentId, isPresent);
    }
}
