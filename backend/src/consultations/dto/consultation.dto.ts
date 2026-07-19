import { Type } from "class-transformer";
import { IsDate, IsDateString, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Matches } from "class-validator";



export class BiometricMeasuresDto {
    @IsOptional()
    @IsNumber({}, { message: 'La température doit être un nombre.' })
    @IsNotEmpty()
    temperature?: number;

    @IsOptional()
    @IsNumber({}, { message: 'Le rythme cardiaque doit être un nombre entier.' })
    @IsNotEmpty()
    heartRate?: number;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @Matches(/^\d{2,3}\/\d{2,3}$/, { message: 'La tension artérielle doit être au format "SYS/DIA" (ex: 118/75).' })
    bloodPressure?: string;
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
}
