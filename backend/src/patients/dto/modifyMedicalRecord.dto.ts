import { IsEnum, IsNumber, IsOptional, IsString, Matches } from "class-validator";
import { BloodType } from '@prisma/client';

export class ModifyMedicalRecordDto {
    
    @IsOptional()
    @IsNumber({}, { message: 'Le poids doit être un nombre.' })
    poids?: number;

    @IsOptional()
    @IsNumber({}, { message: 'La taille doit être un nombre.' })
    taille?: number;

    @IsOptional()
    @IsEnum(BloodType, { message: 'Le groupe sanguin doit être un type de sang valide.' })
    bloodType?: BloodType;

    @IsOptional()
    @IsString({ message: 'Les antécédents médicaux doivent être une chaîne de caractères.' })
    medicalHistory?: string;

    @IsOptional()   
    @IsString({ message: 'L\'histoire familiale doit être une chaîne de caractères.' })
    familyHistory?: string;

    @IsOptional()
    @IsString({ message: 'Les allergies doivent être une chaîne de caractères.' })
    allergies?: string;
}
