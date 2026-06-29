

import { IsString, Matches } from 'class-validator';

export class UpdatePasswordDto {
    // Champs communs (Utilisateur)

    @IsString({ message: 'Le mot de passe actuel doit être une chaîne de caractères.' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/, {
        message: 'Le mot de passe actuel doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial (!@#$%^&*).',
    })
    currentPassword!: string;

    @IsString({ message: 'Le nouveau mot de passe doit être une chaîne de caractères.' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/, {
        message: 'Le nouveau mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial (!@#$%^&*).',
    })
    newPassword!: string;
}