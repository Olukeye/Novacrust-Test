import { Body, Controller, HttpCode, HttpStatus, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegistrationDto, LoginDto } from './dto';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService:AuthService){}

  @Post("/register")
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() data:RegistrationDto){
    return this.authService.register(data)
  }

  @Post("/login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() login:LoginDto){
    return this.authService.login(login);
  }
}
