import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
  origin: [
    'http://localhost:3000',
    'https://register-payment-fe.vercel.app',
    'https://register-event-scheduler-fe.vercel.app'
  ],
  credentials: true,
});


  await app.listen(process.env.PORT || 3001);
  console.log(`✅ Application is running on: ${await app.getUrl()}`);
}

bootstrap();
