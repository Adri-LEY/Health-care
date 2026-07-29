import { IsNumber } from "class-validator";


export class AppointmentDto {
    @IsNumber()
    doctorId!: number;
    
    @IsNumber()
    timeSlotId!: number;
}