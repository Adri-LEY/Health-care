import { IsNumber, IsString, Matches } from "class-validator";
import { Type } from "class-transformer";


export class ActivateStaffAccountDto {
    @IsString({ message: 'Le token d\'activation doit être une chaîne de caractères.' })
    activationToken!: string;

    @IsString({ message: 'Le mot de passe doit être une chaîne de caractères.' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, { message: 'Le mot de passe doit contenir au moins 8 caractères, incluant une majuscule, une minuscule, un chiffre et un caractère spécial.' })
    password!: string
}