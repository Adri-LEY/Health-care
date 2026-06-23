import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

    constructor(
        private readonly prisma: PrismaService, 
        private readonly jwtService: JwtService
    ) {}


    /**
   * Valide les identifiants de l'utilisateur
   * @param loginDto Données de connexion (email et password)
   * @returns Un objet contenant les informations de l'utilisateur si la validation réussit
   * @throws UnauthorizedException (HTTP 401) si l'email ou le mot de passe est incorrect
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) throw new UnauthorizedException('Identifiants invalides');

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid) throw new UnauthorizedException('Identifiants invalides');

    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role 
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}
