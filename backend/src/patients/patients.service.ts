import { Injectable } from '@nestjs/common';
import { PatientsRepository } from './patients.repository';
import { SearchPatientsDto } from './dto/searchPatients.dto';
import { Prisma } from '@prisma/client';

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


    async getMedicalRecordWithProfileByPatientId(patientId: number) {
        const patientInfos = await this.patientsRepository.getMedicalRecordWithProfileByPatientId(patientId);
        return patientInfos;
    }   
}
