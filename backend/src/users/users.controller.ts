import { Controller, Get, Post, Body, Patch, Param, Delete, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { UpdateProfileDto } from './dto/updateProfile.dto';
import { UpdatePasswordDto } from './dto/updatePassword.dto';


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @UseGuards(JwtGuard) // 🔒 Le guard intercepte la requête ici
  @HttpCode(HttpStatus.OK)
  async getProfile(@Req() req) {
    // Grâce à request.user = payload dans le guard, l'id est dispo ici :
    const userId = req.user.sub; 
    return this.usersService.getProfile(userId);
  }
  

  @Patch('update-profile')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async updateProfile(@Req() req, @Body() updateProfileDto: UpdateProfileDto) {
    const userId = req.user.sub;
    return this.usersService.updateProfile(updateProfileDto, userId);
  }


  @Patch('update-password')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async updatePassword(@Req() req, @Body() updatePasswordDto: UpdatePasswordDto) {
    const userId = req.user.sub;
    return this.usersService.updatePassword(userId, updatePasswordDto);
  }
}
