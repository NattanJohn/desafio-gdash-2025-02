import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherLog, WeatherLogDocument } from './schemas/weather-logs.schema';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { UpdateWeatherLogDto } from './dto/update-weather-log.dto';

@Injectable()
export class WeatherLogsService {
  constructor(
    @InjectModel(WeatherLog.name)
    private weatherLogModel: Model<WeatherLogDocument>,
  ) {}

  async create(
    createWeatherLogDto: CreateWeatherLogDto,
  ): Promise<WeatherLogDocument> {
    const createdLog = new this.weatherLogModel(createWeatherLogDto);
    return createdLog.save();
  }

  async findAll(): Promise<WeatherLogDocument[]> {
    return this.weatherLogModel.find().exec();
  }

  async findOne(id: string): Promise<WeatherLogDocument> {
    const log = await this.weatherLogModel.findById(id).exec();
    if (!log) {
      throw new NotFoundException(
        `Registro de clima com ID "${id}" não encontrado.`,
      );
    }
    return log;
  }

  async update(
    id: string,
    updateWeatherLogDto: UpdateWeatherLogDto,
  ): Promise<WeatherLogDocument> {
    const existingLog = await this.weatherLogModel
      .findByIdAndUpdate(id, { $set: updateWeatherLogDto }, { new: true })
      .exec();

    if (!existingLog) {
      throw new NotFoundException(
        `Registro de clima com ID "${id}" não encontrado para atualização.`,
      );
    }
    return existingLog;
  }

  async remove(id: string): Promise<any> {
    const result = await this.weatherLogModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(
        `Registro de clima com ID "${id}" não encontrado para exclusão.`,
      );
    }
    return { message: 'Registro excluído com sucesso.' };
  }
}
