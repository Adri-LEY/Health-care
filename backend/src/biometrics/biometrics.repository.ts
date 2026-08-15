import { PrismaService } from "src/prisma/prisma.service";
import { CreateBiometricMeasuresDto, SingleMeasureDto } from "./dto/createBiometricMeasure.dto";
import { BiometricMeasure, Imc, MeasurementType } from "@prisma/client";
import { Injectable } from "@nestjs/common/decorators/core/injectable.decorator";
import { BadRequestException } from "@nestjs/common/exceptions/bad-request.exception";

@Injectable()
export class BiometricsRepository {

    constructor(private readonly prisma: PrismaService) { }

    async findMedicalRecordById(id: number) {
        return this.prisma.medicalRecord.findUnique({
            where: { id },
        });
    }

    async createMeasuresAndUpdateRecord(
        medicalRecordId: number,
        measures: SingleMeasureDto[],
        nurseAssistantUserId: number,
        updatedWeight?: number,
        updatedHeight?: number,
        calculatedBmiCategory?: Imc | null,
        consultationId?: number,
    ) {

        const processedMeasures: Array<{
            type: MeasurementType;
            value?: number;
            stringValue?: string;
            unit?: string;
        }> = [];

        for (const m of measures) {
            if (m.type === MeasurementType.BLOOD_PRESSURE && m.stringValue) {
                // Expression régulière pour extraire les deux nombres séparés par /
                const match = m.stringValue.trim().match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);

                console.log(`Processing blood pressure: ${m.stringValue}, Match: ${match}`);

                if (match) {
                    const systolic = parseFloat(match[1]);
                    const diastolic = parseFloat(match[2]);

                    // On pousse la mesure Systolique
                    processedMeasures.push({
                        type: MeasurementType.BLOOD_PRESSURE_SYSTOLIC,
                        value: systolic,
                        unit: m.unit || 'mmHg',
                    });

                    // On pousse la mesure Diastolique
                    processedMeasures.push({
                        type: MeasurementType.BLOOD_PRESSURE_DIASTOLIC,
                        value: diastolic,
                        unit: m.unit || 'mmHg',
                    });
                }
                else throw new BadRequestException(`format invalide: ${m.stringValue}. Format attendu: "systolic/diastolic"`);
            }
            processedMeasures.push(m);
           
        }

        const measuresToCreate = processedMeasures.map((m) => ({
            type: m.type,
            value: m.value,
            stringValue: m.stringValue,
            unit: m.unit,
            medicalRecordId,
            takenById: nurseAssistantUserId,
        }));


        return this.prisma.$transaction(async (tx) => {
            // 1. Enregistrement dans BiometricMeasure
            await tx.biometricMeasure.createMany({
                data: measuresToCreate,
            });

            // 2. Mise à jour du MedicalRecord (Poids, Taille, IMC)
            if (updatedWeight !== undefined || updatedHeight !== undefined) {
                await tx.medicalRecord.update({
                    where: { id: medicalRecordId },
                    data: {
                        poids: updatedWeight,
                        taille: updatedHeight,
                        imc: calculatedBmiCategory,
                    },
                });
            }

            // 3. Liaison avec la Consultation (Sauvegarde en Tableau JSON)
            if (consultationId) {
                const biometricsJson = JSON.stringify(processedMeasures); // <-- Tableau complet !

                await tx.consultation.update({
                    where: { id: consultationId },
                    data: {
                        biometricMeasures: biometricsJson,
                    },
                });
            }

            return { count: processedMeasures.length };
        });
    }

    async findHistoryByMedicalRecordAndType(
        medicalRecordId: number,
        type?: MeasurementType,
    ): Promise<BiometricMeasure[]> {
        return this.prisma.biometricMeasure.findMany({
            where: {
                medicalRecordId,
                ...(type && { type }),
            },
            include: {
                takenBy: {
                    select: {
                        id: true,
                        staff: {
                            select: {
                                user: {
                                    select: {
                                        firstName: true,
                                        lastName: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: { takenAt: 'desc' },
        });
    }

    private mapArrayToConsultationJsonObject(measures: Array<{ type: string; value: any; stringValue?: string | null }>): string {
        const resultMap: Record<string, any> = {};
        let sys: number | string | null = null;
        let dia: number | string | null = null;

        for (const m of measures) {
            const val = Number(m.value);

            switch (m.type) {
                case 'TEMPERATURE':
                    resultMap.temperature = val;
                    break;
                case 'HEART_RATE':
                    resultMap.heartRate = val;
                    break;
                case 'HEIGHT':
                    resultMap.height = val;
                    break;
                case 'WEIGHT':
                    resultMap.weight = val;
                    break;
                case 'OXYGEN_SATURATION':
                    resultMap.oxygenSaturation = val; // Nouvelle propriété
                    break;
                case 'BLOOD_GLUCOSE':
                    resultMap.bloodGlucose = val;     // Nouvelle propriété
                    break;
                case 'BLOOD_PRESSURE_SYSTOLIC':
                case 'SYSTOLIC':
                    sys = isNaN(val) ? m.value : val;
                    break;
                case 'BLOOD_PRESSURE_DIASTOLIC':
                case 'DIASTOLIC':
                    dia = isNaN(val) ? m.value : val;
                    break;
                case 'BLOOD_PRESSURE':
                    if (!m.value && m.stringValue) {
                        resultMap.bloodPressure = String(m.value);

                        // Découpage automatique si le format est "120/80"
                        if (typeof m.stringValue === 'string' && m.stringValue.includes('/')) {
                            const [parsedSys, parsedDia] = m.stringValue.split('/');
                            if (parsedSys && parsedDia) {
                                sys = parsedSys.trim();
                                dia = parsedDia.trim();

                                resultMap.systolic = isNaN(Number(sys)) ? sys : Number(sys);
                                resultMap.diastolic = isNaN(Number(dia)) ? dia : Number(dia);
                            }
                        }
                        break;
                    }
                    else {
                        resultMap.bloodPressure = isNaN(val) ? m.value : val;
                    }
                case 'CHOLESTEROL':
                    resultMap.cholesterol = val;
                    break;
                default:
                    const camelKey = m.type.toLowerCase().replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
                    resultMap[camelKey] = isNaN(val) ? m.value : val;
                    break;
            }
        }

        if (sys !== null && dia !== null) {
            resultMap.bloodPressure = `${sys}/${dia}`;
            resultMap.systolic = sys;
            resultMap.diastolic = dia;
        } else if (sys !== null) {
            resultMap.systolic = sys;
        } else if (dia !== null) {
            resultMap.diastolic = dia;
        }

        return JSON.stringify(resultMap);
    }

    async linkBiometricMeasuresToConsultation(
        consultationId: number,
        biometricIds: number[],
    ) {
        // 1. Récupérer uniquement le type et la valeur des mesures demandées
        const measures = await this.prisma.biometricMeasure.findMany({
            where: {
                id: { in: biometricIds },
            },
            select: {
                type: true,
                value: true,
                stringValue: true,
            },
        });

        if (measures.length === 0) {
            return null;
        }

        console.log("Retrieved measures for linking:", measures);

        // 2. Transformer le tableau [{type, value}] en chaîne JSON plat {"temperature": 36.6, ...}
        const biometricsJson = this.mapArrayToConsultationJsonObject(measures);

        console.log("biometricsJson:", biometricsJson);

        // 3. Sauvegarder dans la Consultation
        return await this.prisma.consultation.update({
            where: { id: consultationId },
            data: {
                biometricMeasures: biometricsJson,
            },
        });
    }


    async getRecentBiometricsWithinTwoHoursForMedicalRecord(medicalRecordId: number): Promise<BiometricMeasure[]> {
        const twoHoursAgo = new Date();
        twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);

        console.log("biometricsData:", await this.prisma.biometricMeasure.findMany({}));
        console.log("medicalRecordId:", medicalRecordId);

        const result = await this.prisma.biometricMeasure.findMany({
            where: {
                medicalRecordId: medicalRecordId,
                takenAt: {
                    gte: twoHoursAgo,
                },
                type: {
                    notIn: [MeasurementType.BLOOD_PRESSURE_SYSTOLIC, MeasurementType.BLOOD_PRESSURE_DIASTOLIC],
                },
            },
        });

        return result;
    }

    async getBiometricMeasureById(id: number): Promise<BiometricMeasure | null> {
        return await this.prisma.biometricMeasure.findUnique({
            where: { id },
        });
    }
}