import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';

@Controller('appointments')
export class AppointmentsController {

    constructor(private readonly appointmentsService: AppointmentsService) { }

    @Get('/doctor/:doctorId/availabilities')
    async getDoctorAvailabilities(
        @Param('doctorId', ParseIntPipe) doctorId: number,
        @Query('date') dateQuery?: string
    ) {
        return await this.appointmentsService.getDoctorAvailabilities(doctorId, dateQuery);
    }
}
