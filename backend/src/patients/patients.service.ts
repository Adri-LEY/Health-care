import { Injectable } from '@nestjs/common';
import { PatientsRepository } from './patients.repository';
import { SearchPatientsDto } from './dto/searchPatients.dto';
import { Prisma } from '@prisma/client';
import { StaffRepository } from 'src/staff/staff.repository';
import { MedicalRecordRepository } from './medicalRecord.repository';

@Injectable()
export class PatientsService {

    constructor(
        private readonly patientsRepository: PatientsRepository,
        private readonly medicalRecordRepository: MedicalRecordRepository,
        private readonly staffRepository: StaffRepository
    ) {}

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
    async removeDoctorFromPatient(patientId: number, user: any) {
        const patient = await this.patientsRepository.findPatientById(patientId);

        const userDoctorId = await this.staffRepository.getDoctorIdByUserId(user.id);

        if (!patient) {
            throw new Error(`Patient with ID ${patientId} not found`);
        }

        if (!patient.doctorId) {
            throw new Error(`Patient with ID ${patientId} does not have a doctor assigned`);
        }

        if (patient.doctorId !== userDoctorId) {
            throw new Error(`User is not the assigned doctor for patient with ID ${patientId}`);
        }

        return this.patientsRepository.removeDoctorFromPatient(patientId);
    }


    /**
     * Searches for patients based on a query and limit.
     * @param dto 
     * @returns An array of patients matching the search criteria
     * @throws Error if no patients are found matching the search criteria
     */
    async searchPatientsByQuery(dto: SearchPatientsDto) {
        const searchTerms = dto.q ? dto.q.trim().split(/\s+/) : [];

        // On construit la condition ici (Logique métier)
        const whereCondition: Prisma.UserWhereInput = {
            role: 'PATIENT',
        };

        if (searchTerms.length >= 2) {
            const firstPart = searchTerms[0];
            const secondPart = searchTerms.slice(1).join(' ');

            whereCondition.AND = [
                {
                    OR: [
                        {
                            AND: [
                                { firstName: { contains: firstPart, mode: 'insensitive' } },
                                { lastName: { contains: secondPart, mode: 'insensitive' } }
                            ]
                        },
                        {
                            AND: [
                                { lastName: { contains: firstPart, mode: 'insensitive' } },
                                { firstName: { contains: secondPart, mode: 'insensitive' } }
                            ]
                        }
                    ]
                }
            ];
        } else if (searchTerms.length === 1) {
            whereCondition.OR = [
                { firstName: { contains: searchTerms[0], mode: 'insensitive' } },
                { lastName: { contains: searchTerms[0], mode: 'insensitive' } },
            ];
        }

        // On envoie la condition toute prête au Repository
        return await this.patientsRepository.searchPatientsByQuery(whereCondition, dto.limit);
    }


    /**
     *  Retrieves the medical record along with the patient's profile information by patient ID.
     * @param patientId 
     * @returns An object containing the medical record and the patient's profile information
     * @throws Error if the patient or medical record is not found
     */
    async getMedicalRecordWithProfileByPatientId(patientId: number) {
        const patientInfos = await this.patientsRepository.getMedicalRecordWithProfileByPatientId(patientId);
        return patientInfos;
    }   


    /**
     * Modifies the medical record of a patient.
     * @param medicalRecordId 
     * @param data 
     * @returns The updated medical record
     * @throws Error if the medical record is not found
     */
    async modifyMedicalRecord(patientId: number, data: any) {
        const medicalRecordId = await this.patientsRepository.getMedicalRecordIdByPatientId(patientId);
        if (!medicalRecordId) {
            throw new Error('Medical record not found for the specified patient');
        }
        const updatedMedicalRecord = await this.medicalRecordRepository.modifyMedicalRecord(medicalRecordId.medicalRecordId, data);
        return updatedMedicalRecord;
    }
}
