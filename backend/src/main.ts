import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:5173',
    // Define quais métodos HTTP são permitidos
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    // Permite cookies e cabeçalhos de autorização
    credentials: true,
  });
  // ----------------------------------------------------

  // Inicia o servidor, escutando na porta 3000
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
