import { IsInt, IsOptional, ValidateIf, IsNotEmpty } from 'class-validator';

export class AssignStaffMemberDto {
    @IsNotEmpty({ message: "L'ID de l'utilisateur est requis." })
    @IsInt({ message: "L'ID de l'utilisateur doit être un nombre entier." })
    userId!: number;

    // 1. specialtyId est requis UNIQUEMENT SI serviceId est absent (Vérifie qu'au moins l'un des deux est fourni)
    @ValidateIf(o => !o.serviceId)
    @IsNotEmpty({ message: "Veuillez fournir soit un ID de spécialité, soit un ID de service." })
    // 2. Si specialtyId est fourni, il doit obligatoirement être un entier
    @IsOptional()
    @IsInt({ message: "L'ID de la spécialité doit être un nombre entier." })
    // 3. Si serviceId est AUSSI fourni, on invalide volontairement la propriété en forçant une validation impossible
    @ValidateIf(o => o.serviceId !== undefined && o.serviceId !== null)
    @IsNotEmpty({ message: "Action impossible : impossible d'affecter une spécialité ET un service simultanément." })
    specialtyId?: number;

    @IsOptional()
    @IsInt({ message: "L'ID du service doit être un nombre entier." })
    serviceId?: number;
}