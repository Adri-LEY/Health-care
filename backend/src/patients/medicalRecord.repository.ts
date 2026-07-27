import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { ModifyMedicalRecordDto } from "./dto/modifyMedicalRecord.dto";


@Injectable()
export class MedicalRecordRepository {

    constructor(private readonly prisma: PrismaService) {}

    findMedicalRecordById(medicalRecordId: number) {
        return this.prisma.medicalRecord.findUnique({
            where: { id: medicalRecordId },
        });
    }


    modifyMedicalRecord(medicalRecordId: number, data: ModifyMedicalRecordDto) {
        return this.prisma.medicalRecord.update({
            where: { id: medicalRecordId },
            data: {
                poids: data.poids,
                taille: data.taille,
                bloodType: data.bloodType,
                medical_history: data.medicalHistory,
                family_history: data.familyHistory,
                allergies: data.allergies,
                imc: data.imcCategory,
            },
        });
    }
}