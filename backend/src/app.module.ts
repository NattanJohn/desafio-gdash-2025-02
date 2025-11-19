import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { WeatherLogsModule } from './weather-logs/weather-logs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: `mongodb://${configService.get('MONGO_USER')}:${configService.get('MONGO_PASS')}@${configService.get('MONGO_HOST')}:${configService.get('MONGO_PORT')}`,
        dbName: 'gdash_weather_db',
      }),
      inject: [ConfigService],
    }),

    // Módulos que criaremos:
    // WeatherLogsModule,
    UsersModule,

    AuthModule,

    WeatherLogsModule,
    // InsightsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
