import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Roles } from 'src/auth/roles.decorator';
import { PredictionInputsDto } from './dto/predictionInputs.dto';
import { AiService } from './ai.service';
import { JwtGuard } from 'src/auth/jwt.guard';
import { UserStatusGuard } from 'src/auth/status.guard';
import { RolesGuard } from 'src/auth/roles.guard';

//@UseGuards(JwtGuard, UserStatusGuard, RolesGuard) // Ajout du JwtGuard pour sécuriser les routes
@Controller('ai')
export class AiController {

    constructor(private readonly aiService: AiService) {}

    //@Roles('DOCTOR')
    @Post('/predict')
    async predict(@Body() predictionInputs: PredictionInputsDto): Promise<any> {
        const result = await this.aiService.predict(predictionInputs);
        return result;
    }
}
