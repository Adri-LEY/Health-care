import { Controller, Get } from '@nestjs/common';
import { StatisticsService } from './statistics.service';

@Controller('statistics')
export class StatisticsController {
    constructor(private readonly statisticsService: StatisticsService) {}

    @Get('/admin-stats')
    async getAdminStats() {
        const stats = await this.statisticsService.getAdminStats();
        
        return {
            success: true,
            stats: stats,
        };
    }
}
