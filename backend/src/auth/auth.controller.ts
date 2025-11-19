import { Controller, Post, Request, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { AuthRequest } from './interfaces/auth-request.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @UseGuards(AuthGuard('local'))
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  login(@Request() req: AuthRequest, @Body() _loginDto: LoginDto) {
    return this.authService.login(req.user);
  }
}
