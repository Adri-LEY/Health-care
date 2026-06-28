import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) { }


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

    if (!isPasswordValid) throw new UnauthorizedException('Identifiants invalides');

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

  /**
   * Gère la réinitialisation du mot de passe pour un utilisateur donné
   * @param email L'adresse email de l'utilisateur qui a oublié son mot de passe
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return;
    }

    const payload = { sub: user.id, email: user.email, hashedPassword: user.password, type: 'forgot-password' };

    const token = await this.jwtService.signAsync(
      payload,
      {
        secret: process.env.JWT_PASSWORD_RESET_SECRET,
        expiresIn: process.env.JWT_PASSWORD_RESET_EXPIRATION as any
      }
    );

    const baseURL = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${baseURL}/reset-password?token=${token}`;

    // On simule l'envoi de l'email en affichant le lien de réinitialisation dans la console
    console.log(`Lien de réinitialisation du mot de passe pour ${email}: ${resetLink}`);

  }


  async resetPassword(ResetPasswordDto: ResetPasswordDto) {
    try {
      console.log('Token reçu pour la réinitialisation du mot de passe:', ResetPasswordDto.token);
      const payload = await this.jwtService.verifyAsync(ResetPasswordDto.token, {
        secret: process.env.JWT_PASSWORD_RESET_SECRET
      });

      console.log('Payload du token:', payload);

      if (payload.type !== 'forgot-password') {
        throw new BadRequestException('Token invalide');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      if (!user) {
        throw new BadRequestException('Utilisateur introuvable');
      }

      if(user.password !== payload.hashedPassword) {
        throw new BadRequestException({
          statusCode: 400,
          message: 'Le lien est invalide ou a déjà été utilisé. Veuillez demander un nouveau lien de réinitialisation.',
        });
      }

      const hashedPassword = await bcrypt.hash(ResetPasswordDto.newPassword, 10);

      await this.prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      else throw new UnauthorizedException('Token invalide');
    }
  }
}