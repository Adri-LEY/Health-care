import { Type } from "class-transformer";
import { IsDate, IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from "class-validator";


export class NewPatientDto {

    @IsString({ message: 'Le prénom doit être une chaîne de caractères.' })
    firstName!: string;

    @IsString({ message: 'Le nom de famille doit être une chaîne de caractères.' })
    lastName!: string;

    @IsString({ message: 'L\'email doit être une chaîne de caractères.' })
    @IsEmail({}, { message: 'Veuillez fournir une adresse email valide.' })
    email!: string;

    @IsString({ message: 'Le mot de passe doit être une chaîne de caractères.' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {message: 
        'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.'})
    password!: string;

    @IsOptional()
    @IsString({ message: 'Le numéro de téléphone doit être une chaîne de caractères.' })
    @Matches(/^[0-9+\s().-]{6,20}$/, {
        message: 'Veuillez fournir un numéro de téléphone valide.',
    })
    telephone?: string;

    @IsString({ message: 'Le sexe doit être une chaîne de caractères.' })   
    @Matches(/^(M|F|Autre)$/, {
        message: 'Le sexe doit être "M", "F" ou "Autre".',
    })
    gender!: string;

    @IsNotEmpty({ message: 'La date de naissance est obligatoire.' })
    @Type(() => Date)
    @IsDate({ message: 'La date de naissance doit être une date valide.' })
    birthDate!: Date;

    @IsString({ message: 'L\'adresse doit être une chaîne de caractères.' })
    address!: string;
}