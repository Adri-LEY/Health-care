import { IsBoolean, IsNumber } from "class-validator";


export class PredictionInputsDto {
    @IsNumber()
    patientId!: number;

    @IsNumber({}, { each: true })
    biometricsIds!: number[];

    @IsBoolean()
    isSmoking!: boolean;

    @IsBoolean()
    isAlcoholic!: boolean;

    @IsBoolean()
    isActive!: boolean;
}