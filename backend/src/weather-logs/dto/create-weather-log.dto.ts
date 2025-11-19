import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

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
}
