import { Body, Controller, Post, Query, Req, Res, Sse, UseGuards } from '@nestjs/common';
import { type Response } from 'express';
import { ChatbotService } from './chatbot.service';
import { Observable } from 'rxjs/internal/Observable';
import { RolesGuard } from 'src/auth/roles.guard';
import { JwtGuard } from 'src/auth/jwt.guard';
import { UserStatusGuard } from 'src/auth/status.guard';
import { Roles } from 'src/auth/roles.decorator';

@UseGuards(JwtGuard, UserStatusGuard, RolesGuard)
@Controller('chatbot')
export class ChatbotController {

    constructor(private readonly chatbotService: ChatbotService) {}


    @Roles('PATIENT')
    @Post('/new-chat')
    async createNewChat(
        @Req() req
    ) {
        const userId = (req as any).user?.id;

        await this.chatbotService.createNewChat(userId);

        return {
            success: true,
            message: 'New chat created successfully',
        }
    }

    @Roles('PATIENT')
    @Post('/send-message')
    async sendMessage(
        @Req() req,
        @Body('message') message: string
    ) {
        const userId = (req as any).user?.id;

        const response = await this.chatbotService.sendMessage(
            userId,
            message || 'Bonjour',
        );

        return {
            success: true,
            message: message,
            response: response,
        }
    }
}
