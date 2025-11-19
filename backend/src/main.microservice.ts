import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const configService = app.get(ConfigService);

  const rabbitmqUrl = `amqp://${configService.get('RABBITMQ_USER')}:${configService.get('RABBITMQ_PASS')}@${configService.get('RABBITMQ_HOST')}:${configService.get('RABBITMQ_PORT')}`;

  const microservice =
    await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
      transport: Transport.RMQ,
      options: {
        urls: [rabbitmqUrl],
        queue: 'weather_logs_queue',
        queueOptions: {
          durable: false,
        },
      },
    });

  await microservice.listen();
  console.log(
    'Microserviço Consumer do RabbitMQ iniciado e escutando a fila...',
  );
}
bootstrap().catch((err) => {
  console.error('Erro ao iniciar o Microserviço Consumer:', err);
  process.exit(1);
});
