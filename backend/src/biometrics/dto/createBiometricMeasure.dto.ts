import { IsEnum, IsNumber, IsOptional, IsString, IsNotEmpty, IsArray, ValidateNested, IsInt, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';
import { MeasurementType } from '@prisma/client';

export class SingleMeasureDto {
  @IsEnum(MeasurementType)
  @IsNotEmpty()
  type!: MeasurementType;

  // Validé uniquement si stringValue n'est PAS renseigné
  @ValidateIf((o) => o.stringValue === undefined || o.stringValue === null || o.stringValue === '')
  @IsNumber()
  @IsNotEmpty()
  value?: number;

  // Validé uniquement si value n'est PAS renseigné
  @ValidateIf((o) => o.value === undefined || o.value === null)
  @IsString()
  @IsNotEmpty()
  stringValue?: string;

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