import { RiskClass } from "@prisma/client/index-browser";
import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsDate, IsDateString, IsEnum, IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, Max, Min, ValidateNested } from "class-validator";



export class BiometricMeasuresDto {
  // --- Mesures existantes ---

  @IsOptional()
  @IsNumber({}, { message: 'La température doit être un nombre.' })
  temperature?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Le rythme cardiaque doit être un nombre entier.' })
  heartRate?: number;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2,3}\/\d{2,3}$/, { message: 'La tension artérielle doit être au format "SYS/DIA" (ex: 118/75).' })
  bloodPressure?: string;

  // --- Nouvelles mesures biométriques ---
  @IsOptional()
  @IsNumber({}, { message: 'La taille doit être un nombre (en cm ou m).' })
  @Min(0, { message: 'La taille doit être positive.' })
  height?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Le poids doit être un nombre (en kg).' })
  @Min(0, { message: 'Le poids doit être positif.' })
  weight?: number;

  @IsOptional()
  @IsNumber({}, { message: 'La saturation en oxygène doit être un nombre.' })
  @Min(0, { message: 'La SpO2 ne peut pas être inférieure à 0%.' })
  @Max(100, { message: 'La SpO2 ne peut pas dépasser 100%.' })
  oxygenSaturation?: number;

  @IsOptional()
  @IsNumber({}, { message: 'La fréquence respiratoire doit être un nombre.' })
  @Min(0, { message: 'La fréquence respiratoire doit être positive.' })
  respiratoryRate?: number;

  @IsOptional()
  @IsNumber({}, { message: 'La glycémie doit être un nombre (en g/L ou mmol/L).' })
  @Min(0, { message: 'La glycémie doit être positive.' })
  bloodGlucose?: number;

    @IsOptional()
    @IsNumber({}, { message: 'Le cholestérol doit être un nombre (en g/L ou mmol/L).' })
    @Min(0, { message: 'Le cholestérol doit être positif.' })
  cholesterol?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Le périmètre crânien doit être un nombre (en cm).' })
  @Min(0, { message: 'Le périmètre crânien doit être positif.' })
  headCircumference?: number;

  @IsOptional()
  @IsNumber({}, { message: "L'IMC doit être un nombre." })
  @Min(0, { message: "L'IMC doit être positif." })
  imc?: number;
}

export class PrescriptionItemDto {
    // --- Informations générales de l'élément ---
    @IsString()
    @IsNotEmpty({ message: 'Le nom de l\'élément est obligatoire.' })
    name!: string;

    @IsString()
    @IsNotEmpty({ message: 'La description est obligatoire.' })
    description!: string;

    @IsString()
    @IsNotEmpty({ message: 'La posologie ou consigne est obligatoire.' })
    dosage!: string;

    @IsString()
    @IsNotEmpty({ message: 'La durée est obligatoire.' })
    duration!: string;

    // --- CAS 1 : Médicament (Optionnel) ---
    @IsOptional()
    @IsInt({ message: 'L\'ID du médicament doit être un entier.' })
    medicationId?: number;

    // --- CAS 2 : Matériel Médical (Optionnel) ---
    @IsOptional()
    @IsInt({ message: 'L\'ID du matériel médical doit être un entier.' })
    equipmentId?: number;

    // --- CAS 3 : Soins Paramédicaux (Optionnel) ---
    @IsOptional()
    @IsInt({ message: 'L\'ID des soins paramédicaux doit être un entier.' })
    careId?: number;
}

export class PrescriptionDto {
    @IsArray()
    @ArrayMinSize(1, { message: 'Une ordonnance doit contenir au moins un élément.' })
    @ValidateNested({ each: true })
    @Type(() => PrescriptionItemDto)
    elements!: PrescriptionItemDto[];
}

export class AIPredictionResultDto {
    @IsNumber({}, { message: 'Le score de risque doit être un nombre.' })
    @IsNotEmpty({ message: 'Le score de risque est obligatoire.' })
    riskScore!: number;
    
    @IsEnum(RiskClass, { message: 'La classe de risque doit être "Low", "Moderate" ou "High".' })    
    riskClass!: RiskClass;

    @IsString()
    message!: string;
}

export class ConsultationSummaryDto {

    @IsDateString({}, { message: 'La date doit être une date valide au format ISO 8601.' })
    date!: Date;

    @IsString()
    visitReason!: string;

    @IsString()
    observations!: string;

    @Type(() => BiometricMeasuresDto)
    biometricMeasures!: BiometricMeasuresDto;

    @IsInt()
    medicalRecordId!: number;

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => PrescriptionDto)
    prescription?: PrescriptionDto;

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => AIPredictionResultDto)
    aiPredictionResult?: AIPredictionResultDto;
}
