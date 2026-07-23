import { Injectable, NotFoundException } from '@nestjs/common';
import { Imc, MeasurementType } from '@prisma/client';
import { CreateBiometricMeasuresDto, SingleMeasureDto } from './dto/createBiometricMeasure.dto';
import { BiometricsRepository } from './biometrics.repository';

@Injectable()
export class BiometricsService {

    constructor(private readonly biometricsRepository: BiometricsRepository) { }


    /**
     * Calcule la catégorie d'IMC (Indice de Masse Corporelle) en fonction de la valeur de l'IMC.
     * @param bmi - La valeur de l'IMC à évaluer.
     * @returns La catégorie d'IMC correspondante (Imc.UNDERWEIGHT, Imc.NORMAL_WEIGHT, Imc.OVERWEIGHT, Imc.OBESITY, Imc.CLASS_2_OBESITY, Imc.CLASS_3_OBESITY).
     */
    private calculateBmiCategory(bmi: number): Imc {
        if (bmi < 18.5) return Imc.UNDERWEIGHT;
        if (bmi < 25.0) return Imc.NORMAL_WEIGHT;
        if (bmi < 30.0) return Imc.OVERWEIGHT;
        if (bmi < 35.0) return Imc.OBESITY;
        if (bmi < 40.0) return Imc.CLASS_2_OBESITY;
        return Imc.CLASS_3_OBESITY;
    }

    /**
     * Ajoute des mesures biométriques pour un dossier médical donné et met à jour le poids, la taille et la catégorie d'IMC si nécessaire.
     * @param dto - Les données des mesures biométriques à ajouter.
     * @param nurseAssistantUserId - L'ID de l'assistant(e) médical(e) qui prend les mesures.
     * @returns Un objet contenant un message de succès et le nombre de mesures ajoutées.
     * @throws NotFoundException (HTTP 404) si le dossier médical n'est pas trouvé
     */
    async addMeasures(dto: CreateBiometricMeasuresDto, nurseAssistantUserId: number) {
        // 1. Vérification Métier
        const medicalRecord = await this.biometricsRepository.findMedicalRecordById(dto.medicalRecordId);
        if (!medicalRecord) {
            throw new NotFoundException(`Medical record #${dto.medicalRecordId} not found`);
        }

        // 2. Extraction du Poids / Taille du lot
        const weightMeasure = dto.measures.find((m) => m.type === MeasurementType.WEIGHT);
        const heightMeasure = dto.measures.find((m) => m.type === MeasurementType.HEIGHT);

        const updatedWeight = weightMeasure ? weightMeasure.value : medicalRecord.poids;
        const updatedHeight = heightMeasure ? heightMeasure.value : medicalRecord.taille;

        let bmiCategory: Imc | null = null;

        // 3. Logique Métier : Calcul d'IMC
        if (updatedWeight && updatedHeight && updatedHeight > 0) {
            const calculatedBmi = parseFloat((updatedWeight / (updatedHeight * updatedHeight)).toFixed(2));
            bmiCategory = this.calculateBmiCategory(calculatedBmi);
        }

        // 4. Persistence via le Repository
        const hasWeightOrHeight = !!(weightMeasure || heightMeasure);

        await this.biometricsRepository.createMeasuresAndUpdateRecord(
            dto.medicalRecordId,
            dto.measures,
            nurseAssistantUserId,
            hasWeightOrHeight ? updatedWeight ?? undefined : undefined,
            hasWeightOrHeight ? updatedHeight ?? undefined : undefined,
            hasWeightOrHeight ? bmiCategory : undefined,
        );

        return { message: 'Biometric measures recorded successfully', count: dto.measures.length };
    }

    /**
     * Récupère l'historique des mesures biométriques pour un dossier médical donné, avec un filtre optionnel par type de mesure.
     * @param medicalRecordId - L'ID du dossier médical pour lequel récupérer l'historique.
     * @param type - (Optionnel) Le type de mesure à filtrer (par exemple, poids, taille, etc.). 
     * @returns Une liste de mesures biométriques correspondant aux critères spécifiés.
     * @throws NotFoundException (HTTP 404) si le dossier médical n'est pas trouvé
     */
    async getHistory(medicalRecordId: number, type?: MeasurementType) {
        return this.biometricsRepository.findHistoryByMedicalRecordAndType(medicalRecordId, type);
    }

    
    /**
     * Lie des mesures biométriques existantes à une consultation spécifique.
     * @param consultationId - L'ID de la consultation à laquelle lier les mesures biométriques.
     * @param biometricIds - Une liste d'IDs de mesures biométriques à lier à la consultation.
     * @returns Un objet contenant un message de succès et l'ID de la consultation mise à jour.
     * @throws NotFoundException (HTTP 404) si la consultation n'est pas trouvée
     * @throws NotFoundException (HTTP 404) si aucune mesure biométrique n'est trouvée pour les IDs fournis
     * @throws Error si une erreur survient lors de la mise à jour de la consultation
     */
    async linkMeasuresToConsultation(
        consultationId: number,
        biometricIds: number[],
    ) {
        const updatedConsultation = await this.biometricsRepository.linkBiometricMeasuresToConsultation(
            consultationId,
            biometricIds,
        );

        if (!updatedConsultation) {
            throw new NotFoundException(
                `Aucune mesure biométrique n'a été trouvée pour les IDs fournis.`,
            );
        }

        return {
            message: 'Données biométriques liées à la consultation avec succès',
            consultationId,
        };
    }
}
