import { PartialType } from '@nestjs/mapped-types';
import { CreateWeatherLogDto } from './create-weather-log.dto';

export class UpdateWeatherLogDto extends PartialType(CreateWeatherLogDto) {}
