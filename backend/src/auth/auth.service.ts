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
     * @param loginDto Données de connexion (email ou téléphone et password)
   * @returns Un objet contenant les informations de l'utilisateur si la validation réussit
     * @throws UnauthorizedException (HTTP 401) si l'identifiant ou le mot de passe est incorrect
   */
  async login(loginDto: LoginDto) {
      const email = loginDto.email?.trim().toLowerCase();
      const phone = loginDto.phone?.trim();
      const { password } = loginDto;

      if (!email && !phone) {
        throw new UnauthorizedException('Veuillez fournir un email ou un numéro de téléphone');
      }

      const user = await this.prisma.user.findFirst({
        where: {
          OR: [
            ...(email ? [{ email }] : []),
            ...(phone ? [{ phone }] : []),
          ],
        },
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
        phone: user.phone,
        role: user.role,
      },
    };
  }
}
