import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transform } from 'stream'; // Importação para usar Streams
import { WeatherLog, WeatherLogDocument } from './schemas/weather-logs.schema';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { UpdateWeatherLogDto } from './dto/update-weather-log.dto';
import { Parser } from 'json2csv';

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

  async findRecentLogs(limit: number): Promise<WeatherLogDocument[]> {
    return this.weatherLogModel
      .find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
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

  /**
   * Exporta todos os logs para CSV utilizando Streams.
   * @returns Transform Um fluxo de dados (Stream) contendo o CSV.
   */

  exportToCsvStream(): Transform {
    const logsCursor = this.weatherLogModel.find().lean().cursor();

    const fields = [
      { label: 'ID', value: '_id' },
      'city',
      'country',
      'temperature',
      'humidity',
      { label: 'Data/Hora', value: 'timestamp' },
    ];

    let isFirstChunk = true;

    const csvStream = new Transform({
      writableObjectMode: true,
      transform(
        chunk: Record<string, any>,
        encoding: BufferEncoding,
        callback: (error?: Error | null) => void,
      ) {
        try {
          const json2csv = new Parser({ fields, header: isFirstChunk });
          const csvLine = json2csv.parse([chunk]);

          this.push(
            (isFirstChunk
              ? csvLine
              : csvLine.substring(csvLine.indexOf('\n') + 1)) + '\n',
          );

          isFirstChunk = false;
          callback();
        } catch (error) {
          callback(error as Error);
        }
      },
    });

    return logsCursor.pipe(csvStream);
  }

  /**
   * Exporta todos os logs para XLSX (Placeholder que retorna JSON).
   * @returns Promise<any[]> Retorna o array de logs.
   */
  async exportToXlsx(): Promise<any[]> {
    const logs = await this.weatherLogModel.find().lean().exec();

    if (!logs || logs.length === 0) {
      throw new NotFoundException('Não há registros de clima para exportar.');
    }
    return logs;
  }
}
