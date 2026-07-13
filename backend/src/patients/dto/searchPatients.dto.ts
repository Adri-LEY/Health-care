import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min, MinLength } from "class-validator";


export class SearchPatientsDto {
    @IsOptional()
    @IsString()
    q?: string;

    @IsOptional()
    @Type(() => Number) 
    @IsInt()
    @Min(1)
    @Max(50) 
    limit?: number = 5; 
}