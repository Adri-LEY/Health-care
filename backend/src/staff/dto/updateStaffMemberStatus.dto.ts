import { Type } from "class-transformer"
import { IsNumber, IsString, Matches } from "class-validator"


export class UpdateStaffMemberStatusDto {
    @Type(() => Number)
    @IsNumber({}, { message: 'L\'ID du membre du personnel doit être un nombre.' })
    userId!: number

    @IsString({ message: 'Le statut doit être une chaîne de caractères.' })
    @Matches(/^(ACTIVE|INACTIVE)$/, { message: 'Le statut doit être "ACTIVE", "INACTIVE".' })
    status!: string
}