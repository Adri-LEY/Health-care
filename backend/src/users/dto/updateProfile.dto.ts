import { IsEmail, IsOptional, IsString } from 'class-validator';

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
  phone?: string;


  @IsOptional()
  @IsString({ message: 'L\'adresse doit être une chaîne de caractères.' })
  adress?: string;
}