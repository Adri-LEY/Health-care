import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsDate, IsDateString, IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, ValidateNested } from "class-validator";



export class BiometricMeasuresDto {
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
}
