import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
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
  ],
  controllers: [WeatherLogsController],
  providers: [WeatherLogsService],
  exports: [WeatherLogsService],
})
export class WeatherLogsModule {}
