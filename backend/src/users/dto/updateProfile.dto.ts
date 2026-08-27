import { IsEmail, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateProfileDto {
  // Champs communs (Utilisateur)

  @IsOptional()
  @IsString({ message: 'Le prénom doit être une chaîne de caractères.' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'Le nom doit être une chaîne de caractères.' })
  lastName?: string;

  @IsOptional()
  @IsEmail({}, { message: 'L\'email doit être une adresse email valide.' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Le numéro de téléphone doit être une chaîne de caractères.' })
  @Matches(/^[0-9+\s().-]{6,20}$/, {
    message: 'Veuillez fournir un numéro de téléphone valide.',
  })
  phone?: string;


  @IsOptional()
  @IsString({ message: 'L\'adresse doit être une chaîne de caractères.' })
  address?: string;
}