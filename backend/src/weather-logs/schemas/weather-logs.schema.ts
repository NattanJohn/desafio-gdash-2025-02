import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WeatherLogDocument = WeatherLog & Document;

@Schema()
export class WeatherLog {
  @Prop({ required: true, index: true })
  city: string;

  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  temperature: number;

  @Prop({ required: true })
  humidity: number;

  @Prop({ default: 0 })
  rainProbability: number;

  @Prop({ default: 0 })
  weatherCode: number;

  @Prop({ required: true, default: Date.now, index: true })
  timestamp: Date;
}

export const WeatherLogSchema = SchemaFactory.createForClass(WeatherLog);
