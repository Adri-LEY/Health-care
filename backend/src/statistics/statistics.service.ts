import { Injectable } from '@nestjs/common';
import { AppointmentsRepository } from 'src/appointments/appointments.repository';
import ConsultationsRepository from 'src/consultations/consultations.repository';
import { PatientsRepository } from 'src/patients/patients.repository';
import { StaffRepository } from 'src/staff/staff.repository';

@Injectable()
export class StatisticsService {

    constructor(
        private readonly patientsRepository: PatientsRepository,
        private readonly appointmentsRepository: AppointmentsRepository,
        private readonly staffRepository: StaffRepository,
        private readonly consultationsRepository: ConsultationsRepository
    ) {}

    async getPatientsStats() {
        const result = await this.patientsRepository.getPatientsStats();

        return {
            totalPatients: Number(result[0].total),
            groupedByAge: {
                under18: Number(result[0].under18),
                from18to30: Number(result[0].from18to30),
                from31to45: Number(result[0].from31to45),
                from46to60: Number(result[0].from46to60),
                over60: Number(result[0].over60),
            },
            groupedByGender: {
                male: Number(result[0].male),
                female: Number(result[0].female),
            },
            groupedByInternExtern: {
                intern: Number(result[0].intern),
                extern: Number(result[0].extern),
            },
        };
    }

    async getAppointmentsStats() {
        const result = await this.appointmentsRepository.getAppointmentsStats();

        return {
            totalAppointments: Number(result.totalAppointments),
            upcoming: Number(result.scheduledAppointments),
            completed: Number(result.confirmedAppointments),
            cancelled: Number(result.cancelledAppointments),
            missed: Number(result.missedAppointments),

            groupedBySpecialty: result.specialtyStats,
            evolution: Array.isArray(result.evolution) ? result.evolution : [],
        };
    }

    async getStaffStats() {
        const result = await this.staffRepository.getStaffStats();

        return {
            totalStaff: Number(result.totalStaff),
            totalDoctors: Number(result.doctors),
            totalNurseAssistants: Number(result.nurses),
            totalAdministrators: Number(result.administrators),
            groupedBySpecialty: result.groupedBySpecialty,
        };
    }

    async getAdminStats() {
        const patientStats = await this.getPatientsStats();
        const appointmentStats = await this.getAppointmentsStats();
        const staffStats = await this.staffRepository.getStaffStats();  

        return {
            patients: patientStats,
            appointments: appointmentStats,
            staff: staffStats,
        };
    }

    async getDoctorPatientsStats(doctorId: number) {
        const totalPatients = await this.patientsRepository.getTotalPatientsAssignedToDoctor(doctorId);
        const {riskDistribution, highRiskList} = await this.patientsRepository.getRiskDistributionOfPatientsAssignedToDoctor(doctorId);

        return {
            totalPatients: totalPatients,
            riskDistribution: riskDistribution,
            highRiskList: highRiskList,
        };
    }

    async getDoctorAppointmentsStats(doctorId: number) {
        const todayAppointments = await this.appointmentsRepository.getTodayAppointmentsForDoctor(doctorId);
        const appointmentsStats = await this.appointmentsRepository.getTodayAppointmentsStats();

        return {
            ...appointmentsStats,
            todaySchedule: todayAppointments,
        };
    }

    async getActivityStats(doctorId: number) {
        const monthlyConsultationsEvolution = await this.consultationsRepository.getConsultationsStatsEvolution(doctorId);
        const recentConsultations = await this.consultationsRepository.getRecentConsultations(doctorId, 5);

        return {
            monthlyConsultations: monthlyConsultationsEvolution,
            recentConsultations: recentConsultations,
        };
    }

    async getDoctorStats(doctorId: number) {
        const patientsStats = await this.getDoctorPatientsStats(doctorId);
        const appointmentsStats = await this.getDoctorAppointmentsStats(doctorId);
        const activityStats = await this.getActivityStats(doctorId);

        return {
            patients: patientsStats,
            appointments: appointmentsStats,
            activity: activityStats,
        };
    }
}
