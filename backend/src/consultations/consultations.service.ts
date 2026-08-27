import { BadRequestException, Injectable } from '@nestjs/common';
import ConsultationsRepository from './consultations.repository';
import { ConsultationSummaryDto } from './dto/consultation.dto';
import { PrescriptionCatalogService } from 'src/prescription-catalog/prescription-catalog.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ConsultationsService {
    constructor(
        private readonly consultationsRepository: ConsultationsRepository,
        private readonly prescriptionCatalogService: PrescriptionCatalogService
    ) {}

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

    /**
     * Saves a new consultation summary to the database.
     * @param consultationSummaryDto
     * @returns A promise resolving to the saved consultation.
     */
    async saveNewConsultation(consultationSummaryDto: ConsultationSummaryDto): Promise<any> {
        try {
            const prescriptionItems = consultationSummaryDto.prescription?.elements || [];

            for (const item of prescriptionItems) {
                if (item.medicationId) {
                    const medication = await this.prescriptionCatalogService.findOneMedication(item.medicationId);
                    item.name = medication.name;
                }

                if (item.equipmentId) {
                    const equipment = await this.prescriptionCatalogService.findOneEquipment(item.equipmentId);
                    item.name = equipment.name;
                }
            }

            const result = await this.consultationsRepository.saveNewConsultation(consultationSummaryDto);

            return {
                message: 'Consultation saved successfully.',
                data: result,
            };
        } catch (error) {
            if(error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2003') {
                    throw new BadRequestException('un des IDs fournis (médicament, matériel médical ou soins paramédicaux) n\'existe pas.');  
                }
            }

            throw error;
        }
    }
}
