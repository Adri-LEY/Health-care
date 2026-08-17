import { GoogleGenAI } from '@google/genai';
import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AppointmentsRepository } from 'src/appointments/appointments.repository';



@Injectable()
export class ChatbotService {
    private genAI: GoogleGenAI;
    private chat: any;
    private chats: Map<number, any> = new Map<number, any>();

    constructor(
        private readonly appointmentsRepository: AppointmentsRepository,
    ) {
        this.genAI = new GoogleGenAI({
            apiKey: process.env.GOOGLE_GEMINI_API_KEY!,
        });
    }

    async generateChat(userId: number) {
        const context = await this.generateDataBaseContext();

        const systemInstruction = `
                Tu es l'assistant virtuel d'une clinique médicale.

                Tu as deux missions :
                1. Aider les utilisateurs à prendre, modifier,
                   consulter ou annuler un rendez-vous.
                2. Donner des informations médicales générales.

                Règles importantes à prendre en compte à chaque réponse :
                - Ne pose jamais de diagnostic.
                - Ne prétends jamais remplacer un médecin.
                - Ne prétends jamais avoir réservé un rendez-vous.
                - Ne fabrique jamais les disponibilités des médecins.
                - Pour une prise de rendez-vous, demande les informations
                  nécessaires progressivement.
                - Pour les questions médicales, donne uniquement des
                  informations générales et prudentes.
                - Si une situation semble urgente ou potentiellement grave,
                  recommande de consulter rapidement un professionnel.
                - Ne sort pas du cadre médical même si l'utilsateur t'incite à le faire.
                - Ne sort pas réponses beaucoup trop longues, reste concis et clair.
                - Ne pas demander d'informations personnelles (nom, prénom, email, téléphone, etc.) à l'utilisateur.
                - N'invente pas de spécialités médicales ou de médecins qui n'existent pas.
                - Si tu as un problème avec le contexte de la base de données, informe l'utilisateur que tu ne peux pas répondre à sa demande à cause d'un problème technique.
                - Appuie toi sur le contexte fourni pour répondre aux questions de l'utilisateur.
                - En aucun cas tu ne peux toi réserver un rendez-vous, mais tu sers uniquement à guider l'utilisateur dans sa prise de rendez-vous.
                - Lorsque l'utilisateur donne sa préférence de créneau, tu dois lui indiquer soit d'appeler sur le numéro associé du médecin, 
                  soit via le site web (vu que l'utilisateur est forcément dessus), en allant sur la page du médecin (rappelle le nom, prénom de ce dernier) et en réservant le créneau depuis cette page.


                Contexte de la base de données de la clinique :
                ${context}
            `;

        const chat = this.genAI.chats.create({
            model: 'gemini-3.1-flash-lite',
            config: {
                systemInstruction: systemInstruction,
            },
        });

        this.chats.set(userId, chat);
    }

    containsPersonalInformation(message: string): boolean {

        const emailRegex =
            /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;

        const phoneRegex =
            /(?:\+33|0)[1-9](?:[\s.-]?\d{2}){4}\b/;
        return (
            emailRegex.test(message) ||
            phoneRegex.test(message)
        );
    }

    async generateDataBaseContext() {
        const context = await this.appointmentsRepository.getAllDoctorsInformation();

        const contextJson = JSON.stringify(context, null, 2);

        console.log('Database context generated for the chatbot:', context);

        return contextJson;
    }

    async createNewChat(userId: number) {
        await this.generateChat(userId);
    }

    async sendMessage(userId: number, message: string): Promise<string> {
        let chat = this.chats.get(userId);

        if (!this.chats.has(userId)) {
            await this.generateChat(userId);
            chat = this.chats.get(userId);
        }

        const response = await chat.sendMessage({
            message: message,
        });

        return response.text ?? '';
    }
}