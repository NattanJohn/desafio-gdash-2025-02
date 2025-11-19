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
  Inject,
} from '@nestjs/common';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { AuthGuard } from '@nestjs/passport';
import { WeatherLogsService } from './weather-logs.service';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { UpdateWeatherLogDto } from './dto/update-weather-log.dto';
import { ClientProxy, MessagePattern } from '@nestjs/microservices';

@Controller('weather-logs')
export class WeatherLogsController {
  constructor(
    private readonly weatherLogsService: WeatherLogsService,
    @Inject('WEATHER_SERVICE') private readonly client: ClientProxy,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() createWeatherLogDto: CreateWeatherLogDto) {
    this.client.emit('create_log', createWeatherLogDto);
    return {
      message: 'Log de clima aceito para processamento assíncrono.',
      data: createWeatherLogDto,
    };
  }

  @MessagePattern('create_log')
  handleLogCreation(data: CreateWeatherLogDto) {
    console.log('Mensagem RabbitMQ recebida para salvar log:', data);
    return this.weatherLogsService.create(data);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll() {
    return this.weatherLogsService.findAll();
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
