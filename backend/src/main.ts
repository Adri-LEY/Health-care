import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:5173', // On autorise uniquement ton serveur React
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // Si tu as besoin de gérer des cookies/sessions plus tard
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true}));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
