import { Body, Controller, Post, HttpCode, HttpStatus, UseGuards, Put, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtGuard } from './jwt.guard';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';


@Controller('auth')
export class AuthController {

  constructor(private readonly authService: AuthService) {}

  @Post('login') 
  @HttpCode(HttpStatus.OK) 
  async login(@Body() loginDto: LoginDto) {
    
    return this.authService.login(loginDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.authService.forgotPassword(forgotPasswordDto);

    return { 
      message: 'Si cette adresse email correspond à un compte, un lien de réinitialisation a été généré.' 
    };
  }

  @Put('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.authService.resetPassword(resetPasswordDto);

    return {
      message: 'Le mot de passe a été réinitialisé avec succès.'
    };
  }
}