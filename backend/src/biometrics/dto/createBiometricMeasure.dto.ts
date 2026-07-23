import { IsEnum, IsNumber, IsOptional, IsString, IsNotEmpty, IsArray, ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { MeasurementType } from '@prisma/client';

export class SingleMeasureDto {
  @IsEnum(MeasurementType)
  @IsNotEmpty()
  type!: MeasurementType; // ex: WEIGHT, HEIGHT, BLOOD_PRESSURE, TEMPERATURE...

  @IsNumber()
  @IsNotEmpty()
  value!  : number;

  @IsString()
  @IsOptional()
  unit?: string;
}

export class CreateBiometricMeasuresDto {
  @IsInt()
  @IsNotEmpty()
  medicalRecordId!: number;µ

  @IsInt()
  @IsOptional()
  consultationId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SingleMeasureDto)
  measures!: SingleMeasureDto[]; // <-- Tableau de mesures envoyées d'un coup
}