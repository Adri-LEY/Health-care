import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/jwt.guard';
import { UserStatusGuard } from 'src/auth/status.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { StatisticsService } from './statistics.service';

@UseGuards(JwtGuard, UserStatusGuard, RolesGuard)
@Controller('statistics')
export class StatisticsController {
    constructor(private readonly statisticsService: StatisticsService) {}

    @Roles('ADMINISTRATOR')
    @Get('/admin-stats')
    async getAdminStats() {
        const stats = await this.statisticsService.getAdminStats();
        
        return {
            success: true,
            stats: stats,
        };
    }

    @Roles('DOCTOR')
    @Get('/doctor-stats')
    async getDoctorStats(
        @Req() req
    ) {
        const doctorId = req.user.doctorId; 

        const stats = await this.statisticsService.getDoctorStats(doctorId);

        return {
            success: true,
            stats: stats,
        };
    }
}
