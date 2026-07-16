import { Injectable } from '@nestjs/common';
import ConsultationsRepository from './consultations.repository';

@Injectable()
export class ConsultationsService {
    constructor(private readonly consultationsRepository: ConsultationsRepository) {}

    /**
     * Retrieves the consultation history for a given medical record ID.
     * @param medicalRecordId 
     * @returns An object containing a message and the consultation history data.
     * @throws Error if no consultations are found for the given medical record ID.
     */
    async getConsultationsHistory(medicalRecordId: string): Promise<any> {
        const result = await this.consultationsRepository.getAllConsultations(Number(medicalRecordId));

        if (!result || result.length === 0) {
            throw new Error(`No consultations found for medical record ID ${medicalRecordId}`);
        }

        return {
            message: 'Consultations retrieved successfully.',
            data: result,
        };
    }

    /**
     * Retrieves the details of a specific consultation by its ID.
     * @param consultationId 
     * @returns An object containing a message and the consultation details data.
     * @throws Error if no consultation is found for the given ID.
     */
    async getconsultationDetails(consultationId: string): Promise<any> {
        const result = await this.consultationsRepository.getConsultationById(Number(consultationId));

        if (!result) {
            throw new Error(`No consultation found for consultation ID ${consultationId}`);
        }

        return {
            message: 'Consultation details retrieved successfully.',
            data: result,
        };
    }
}
