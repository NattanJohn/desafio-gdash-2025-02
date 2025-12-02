import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transform } from 'stream';
import { WeatherLog, WeatherLogDocument } from './schemas/weather-logs.schema';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { UpdateWeatherLogDto } from './dto/update-weather-log.dto';
import { Parser } from 'json2csv';
import * as ExcelJS from 'exceljs';

interface WeatherLogLean {
  _id: string;
  timestamp: Date | string | null;
  city: string;
  country: string;
  temperature: number | null;
  humidity: number | null;
}

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

  exportToCsvStream(): Transform {
    const logsCursor = this.weatherLogModel
      .find()
      .sort({ timestamp: -1 })
      .lean()
      .cursor();

    const fields = [
      { label: 'Data e Hora', value: 'formattedDate' },
      { label: 'Cidade', value: 'city' },
      { label: 'País', value: 'country' },
      { label: 'Temp (°C)', value: 'temperature' },
      { label: 'Umidade (%)', value: 'humidity' },
      { label: 'ID', value: '_id' },
    ];

    let isFirstChunk = true;

    const csvStream = new Transform({
      writableObjectMode: true,

      transform(chunk: WeatherLogLean, encoding, callback) {
        try {
          const formattedChunk: Record<string, unknown> = {
            ...chunk,
            formattedDate: chunk.timestamp
              ? new Date(chunk.timestamp).toLocaleString('pt-BR')
              : 'N/A',
            temperature:
              chunk.temperature !== null
                ? String(chunk.temperature).replace('.', ',')
                : '',
          };

          const json2csv = new Parser({
            fields,
            header: isFirstChunk,
            delimiter: ';',
          });

          const csvLine = json2csv.parse([formattedChunk]);

          if (isFirstChunk) {
            this.push('\ufeff');
          }

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

  async exportToXlsx(): Promise<Buffer> {
    const logs = await this.weatherLogModel
      .find()
      .sort({ timestamp: -1 })
      .lean()
      .exec();

    if (!logs || logs.length === 0) {
      throw new NotFoundException('Não há registros para exportar.');
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Dados Climáticos');

    sheet.columns = [
      { header: 'Data/Hora', key: 'timestamp', width: 25 },
      { header: 'Cidade', key: 'city', width: 20 },
      { header: 'País', key: 'country', width: 15 },
      { header: 'Temperatura (°C)', key: 'temperature', width: 18 },
      { header: 'Umidade (%)', key: 'humidity', width: 15 },
      { header: 'ID do Registro', key: '_id', width: 30 },
    ];

    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F46E5' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 30;

    logs.forEach((log) => {
      const row = sheet.addRow({
        timestamp: log.timestamp ? new Date(log.timestamp) : null,
        city: log.city,
        country: log.country,
        temperature: log.temperature,
        humidity: log.humidity / 100,
        _id: log._id.toString(),
      });

      row.getCell('timestamp').numFmt = 'dd/mm/yyyy hh:mm:ss';
      row.getCell('humidity').numFmt = '0%';

      row.eachCell({ includeEmpty: false }, (cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });

      if (log.temperature > 30) {
        row.getCell('temperature').font = {
          color: { argb: 'FFFF0000' },
          bold: true,
        };
        row.getCell('temperature').fill = {
          type: 'pattern',
          pattern: 'lightDown',
          fgColor: { argb: 'FFFFCCCC' },
        };
      }
    });

    return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
  }
}
