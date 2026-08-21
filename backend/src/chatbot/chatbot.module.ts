import { Module } from '@nestjs/common';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { AppointmentsRepository } from 'src/appointments/appointments.repository';

@Module({
  controllers: [ChatbotController],
  providers: [ChatbotService, AppointmentsRepository],
})
export class ChatbotModule {}
