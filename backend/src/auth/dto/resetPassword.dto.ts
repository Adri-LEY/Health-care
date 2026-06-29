import { IsString, Matches } from "class-validator";


export class ResetPasswordDto {
    @IsString({ message: 'Le token est obligatoire.' })
    token!: string;

    @IsString({ message: 'Le nouveau mot de passe doit être une chaîne de caractères.' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.',
    })
    newPassword!: string;
}