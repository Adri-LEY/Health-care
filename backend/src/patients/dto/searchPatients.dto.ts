import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min, MinLength } from "class-validator";


export class SearchPatientsDto {
    @IsOptional()
    @IsString()
    @MinLength(3, { message: 'Le nom doit contenir entre 3 et 50 caractères.' })
    q?: string;

    @IsOptional()
    @Type(() => Number) 
    @IsInt()
    @Min(1)
    @Max(50) 
    limit?: number = 5; 
}