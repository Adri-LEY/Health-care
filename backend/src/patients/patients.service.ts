import { Injectable } from '@nestjs/common';
import { PatientsRepository } from './patients.repository';

@Injectable()
export class PatientsService {

    constructor(private readonly patientsRepository: PatientsRepository) {}

    /**
     * Assigns a doctor to a patient
     * @param patientId 
     * @param doctorId 
     * @returns The updated patient record with the assigned doctor
     */
    async assignDoctorToPatient(patientId: number, doctorId: number) {
        const patient = await this.patientsRepository.findPatientById(patientId);
        if (!patient) {
            throw new Error(`Patient with ID ${patientId} not found`);
        }

        if(patient.doctorId) {
            throw new Error(`Patient with ID ${patientId} already has a doctor assigned`);
        }

        return this.patientsRepository.assignDoctorToPatient(patientId, doctorId);
    }


    /**
     * Removes a doctor from a patient
     * @param patientId 
     * @returns The updated patient record with the doctor removed
     */
    async removeDoctorFromPatient(patientId: number) {
        const patient = await this.patientsRepository.findPatientById(patientId);

        if (!patient) {
            throw new Error(`Patient with ID ${patientId} not found`);
        }

        if (!patient.doctorId) {
            throw new Error(`Patient with ID ${patientId} does not have a doctor assigned`);
        }

        return this.patientsRepository.removeDoctorFromPatient(patientId);
    }
}
