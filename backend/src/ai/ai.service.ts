import { Injectable } from '@nestjs/common';
import { BiometricsRepository } from 'src/biometrics/biometrics.repository';
import { MedicalRecordRepository } from 'src/patients/medicalRecord.repository';
import { PatientsRepository } from 'src/patients/patients.repository';
import { PredictionInputsDto } from './dto/predictionInputs.dto';
import { MeasurementType } from '@prisma/client';

@Injectable()
export class AiService {

    constructor(
        private readonly biometricsRepository: BiometricsRepository,
        private readonly patientsRepository: PatientsRepository,
        private readonly medicalRecordRepository: MedicalRecordRepository
    ) { }

    private getGlucoseClass(val: number): number {
        if (val < 1.00) return 1;
        if (val <= 1.25) return 2;
        return 3;
    }

    private getCholesterolClass(val: number): number {
        if (val < 2.00) return 1;
        if (val <= 2.39) return 2;
        return 3;
    }

    async predict(predictionInputs: PredictionInputsDto) {
        let inputData = {}

        // On récupère les informations du patient pour compléter les données d'entrée
        const patientInfos = await this.patientsRepository.findPatientById(predictionInputs.patientId);

        if (!patientInfos) {
            return { error: `Patient with ID ${predictionInputs.patientId} not found.` };
        }

        inputData['age'] = patientInfos?.age;
        inputData['gender'] = patientInfos?.gender === 'MALE' ? 1 : 2;

        // On récupère la taille et le poids du patient à partir de son dossier médical
        const medicalRecord = await this.patientsRepository.getMedicalRecordByPatientId(predictionInputs.patientId);

        if (medicalRecord) {
            if (medicalRecord?.medicalRecord?.taille) {
                // Convertit 1.76m en 176cm
                const heightMeters = medicalRecord.medicalRecord.taille;
                inputData['height'] = heightMeters < 3 ? Math.round(heightMeters * 100) : Math.round(heightMeters);
            }
            inputData['weight'] = medicalRecord.medicalRecord?.poids;
        }


        // On récupère les mesures biométriques à partir de la liste d'IDs fournie
        await Promise.all(predictionInputs.biometricsIds.map(async (id) => {
            const biometric = await this.biometricsRepository.getBiometricMeasureById(id).catch(err => {
                return { error: `Biometric measure with ID ${id} not found.` };
            })

            if (!biometric) return { error: `Biometric measure with ID ${id} not found.` };

            if ("error" in biometric) {
                return biometric; // Return the error object if the biometric measure is not found
            }

            if (biometric.type == MeasurementType.BLOOD_PRESSURE) {
                console.log("biometric.stringValue: ", biometric.stringValue);

                const [systolic, diastolic] = biometric?.stringValue
                    ? biometric.stringValue.split('/').map(val => Number(val.trim()))
                    : [undefined, undefined];
                inputData['ap_hi'] = systolic;
                inputData['ap_lo'] = diastolic;
            }
            else if (biometric.type == MeasurementType.BLOOD_PRESSURE_SYSTOLIC) {
                inputData['ap_hi'] = biometric.value;
            }
            else if (biometric.type == MeasurementType.BLOOD_PRESSURE_DIASTOLIC) {
                inputData['ap_lo'] = biometric.value;
            }
            else if (biometric.type == MeasurementType.BLOOD_GLUCOSE) {
                if (biometric.value !== null && biometric.value !== undefined) {
                    inputData['gluc'] = this.getGlucoseClass(biometric.value);
                }
            }
            else if (biometric.type == MeasurementType.CHOLESTEROL) {
                if (biometric.value !== null && biometric.value !== undefined) {
                    inputData['cholesterol'] = this.getCholesterolClass(biometric.value);
                }
            }
        }));
        

        // On ajoute les informations sur le mode de vie du patient
        inputData['smoke'] = predictionInputs.isSmoking ? 1 : 0;
        inputData['alco'] = predictionInputs.isAlcoholic ? 1 : 0;
        inputData['active'] = predictionInputs.isActive ? 1 : 0;


        console.log("Final inputData for prediction: ", inputData);

        //On effectue l'appel à l'API externe pour obtenir la prédiction
        const apiUrl = process.env.AI_API_URL || 'http://localhost:8000/predict';
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(inputData)
        });

        return response.json();
    }

}
