import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InsightsService } from './insights.service';
import { InsightsController } from './insights.controller';
import {
  WeatherLog,
  WeatherLogSchema,
} from '../weather-logs/schemas/weather-logs.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WeatherLog.name, schema: WeatherLogSchema },
    ]),
  ],
  controllers: [InsightsController],
  providers: [InsightsService],
  exports: [InsightsService],
})
export class InsightsModule {}
