import { Type } from "class-transformer";
import { IsEAN, IsEmail, IsIn, IsNumber, IsOptional, IsPhoneNumber, IsString, Matches } from "class-validator";


export class NewStaffMemberDto {
    @IsString({ message: 'Le prénom doit être une chaîne de caractères.' })
    firstName!: string;

    @IsString({ message: 'Le nom de famille doit être une chaîne de caractères.' })
    lastName!: string;

    @IsString({ message: 'L\'email doit être une chaîne de caractères.' })
    @IsEmail({}, { message: 'Veuillez fournir une adresse email valide.' })
    email!: string;
    
    @IsString({ message: 'Le mot de passe doit être une chaîne de caractères.' })
    @Matches(/^(\+\d{1,3}[- ]?)?\(?\d{1,4}\)?[- ]?\d{1,4}[- ]?\d{1,9}$/, {
        message: 'Le numéro de téléphone doit être un format valide (ex: +33612345678 ou 0612345678).',
    })
    //@IsPhoneNumber('FR', { message: 'Veuillez fournir un numéro de téléphone valide.' })
    phone!: string;

    @IsString({ message: 'Le rôle doit être une chaîne de caractères.' })
    @IsIn(['DOCTOR', 'NURSE_ASSISTANT', 'ADMINISTRATOR'], { message: 'Le rôle doit être "DOCTOR", "NURSE_ASSISTANT" ou "ADMINISTRATOR".' })
    role!: string;

    @Type(() => Number)
    @IsNumber({}, { message: 'Le numéro de personnel doit être un nombre.' })
    staffNumber!: number;

    @IsString({ message: 'Le numéro d\'inscription doit être une chaîne de caractères.' })
    @Matches(/^[A-Z]{3}-REG-\d{3}$/, { message: 'Le numéro d\'inscription doit être au format "XXX-REG-999".' })
    registrationId!: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'L\'ID de la spécialité doit être un nombre.' })
    specialtyId?: number; // Facultatif pour les médecins

    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'L\'ID du service doit être un nombre.' })
    serviceId?: number; // Facultatif pour les aides-soignants
}
