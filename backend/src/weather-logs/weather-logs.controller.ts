import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Header,
  StreamableFile,
} from '@nestjs/common';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { AuthGuard } from '@nestjs/passport';
import { WeatherLogsService } from './weather-logs.service';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { UpdateWeatherLogDto } from './dto/update-weather-log.dto';

@Controller('weather-logs')
export class WeatherLogsController {
  constructor(private readonly weatherLogsService: WeatherLogsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createWeatherLogDto: CreateWeatherLogDto) {
    const createdLog =
      await this.weatherLogsService.create(createWeatherLogDto);

    return {
      message: 'Log de clima salvo com sucesso via Worker Go (RESTful).',
      data: createdLog,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll() {
    return this.weatherLogsService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('export-csv')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="weather-logs.csv"')
  exportCsv(): Promise<StreamableFile> {
    const csvStream = this.weatherLogsService.exportToCsvStream();
    return Promise.resolve(new StreamableFile(csvStream));
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('export-xlsx')
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @Header('Content-Disposition', 'attachment; filename="weather-logs.xlsx"')
  async exportXlsx(): Promise<any> {
    const logs = await this.weatherLogsService.exportToXlsx();
    return logs;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.weatherLogsService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateWeatherLogDto: UpdateWeatherLogDto,
  ) {
    return this.weatherLogsService.update(id, updateWeatherLogDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.weatherLogsService.remove(id);
  }
}
