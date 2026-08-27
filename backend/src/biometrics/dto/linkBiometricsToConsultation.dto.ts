import { IsArray, IsInt, ArrayMinSize } from 'class-validator';

export class LinkBiometricsToConsultationDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  biometricIds!: number[];
}