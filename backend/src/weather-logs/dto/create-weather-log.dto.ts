import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateWeatherLogDto {
  @IsString()
  @IsNotEmpty()
  readonly city: string;

  @IsString()
  @IsNotEmpty()
  readonly country: string;

  @IsNumber()
  @IsNotEmpty()
  readonly temperature: number;

  @IsNumber()
  @IsNotEmpty()
  readonly humidity: number;
  // Novos campos para IA
  @IsNumber()
  @IsOptional()
  readonly rainProbability?: number;

  @IsNumber()
  @IsOptional()
  readonly weatherCode?: number;
  @IsNumber()
  @IsOptional()
  readonly isDay?: number;
}
