import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WeatherLogsService } from './weather-logs.service';
import { WeatherLogsController } from './weather-logs.controller';
import { WeatherLog, WeatherLogSchema } from './schemas/weather-logs.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WeatherLog.name, schema: WeatherLogSchema },
    ]),
    AuthModule,
    ClientsModule.registerAsync([
      {
        name: 'WEATHER_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              `amqp://${configService.get('RABBITMQ_USER')}:${configService.get('RABBITMQ_PASS')}@${configService.get('RABBITMQ_HOST')}:${configService.get('RABBITMQ_PORT')}`,
            ],
            queue: 'weather_logs_queue',
            queueOptions: {
              durable: false,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [WeatherLogsController],
  providers: [WeatherLogsService],
  exports: [WeatherLogsService, ClientsModule],
})
export class WeatherLogsModule {}
