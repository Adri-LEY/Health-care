import { IsEmail, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class ResendActivationTokenDto {
    @Type(() => Number)
    @IsNumber({}, { message: 'L\'ID de l\'utilisateur doit être un nombre.' })
    userId!: number;

    @IsEmail({}, { message: 'L\'email doit être une adresse email valide.' })
    email!: string
}