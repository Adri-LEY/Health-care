import { IsEmail, IsNotEmpty, IsOptional, Matches, MinLength } from 'class-validator';

export class LoginDto {
  @IsOptional()
  @IsEmail({}, { message: 'Veuillez fournir une adresse email valide.' })
  email?: string;

  @IsOptional()
  @Matches(/^[0-9+\s().-]{6,20}$/, {
    message: 'Veuillez fournir un numéro de téléphone valide.',
  })
  phone?: string;

  @IsNotEmpty({ message: 'Le mot de passe est obligatoire.' })
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères.' })
  password!: string;
}
