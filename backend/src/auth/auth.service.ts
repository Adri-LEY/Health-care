import { BadRequestException, GoneException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';

import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import * as bcrypt from 'bcrypt';
import { NewPatientDto } from './dto/newPatient.dto';
import { PrismaClient } from '@prisma/client/extension';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

@Injectable()
export class AuthService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService
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
   * Envoie un email de réinitialisation de mot de passe à l'utilisateur si l'adresse email fournie correspond à un compte existant.
   * @param email L'adresse email de l'utilisateur qui a oublié son mot de passe
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // Si l'utilisateur n'existe pas, on ne fait rien pour éviter de révéler l'existence d'un compte
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
    const resetUrl = `${baseURL}/reset-password?token=${token}`;

    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Réinitialisation de votre mot de passe',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Bonjour,</h2>
            <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte HealthManager.</p>
            <p>Veuillez cliquer sur le bouton ci-dessous pour définir un nouveau mot de passe (valable 5 minutes) :</p>
            <p style="margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Réinitialiser mon mot de passe
              </a>
            </p>
            <p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail.</p>
          </div>
        `
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de réinitialisation:', error);
    }

  }


  /**
   * Réinitialise le mot de passe de l'utilisateur en utilisant le token de réinitialisation.
   * @param resetPasswordDto Données contenant le token et le nouveau mot de passe
   * @throws BadRequestException (HTTP 400) si le token est invalide ou expiré, ou si l'utilisateur n'est pas trouvé
   * @throws UnauthorizedException (HTTP 401) si le token est invalide
   */
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

      if (user.password !== payload.hashedPassword) {
        throw new GoneException('Le lien de réinitialisation a expiré.');
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
      else throw new GoneException('Le lien de réinitialisation a expiré.');
    }
  }


  /**
   * Crée un nouveau compte pour un nouveau patient.
   * @param newPatientDto 
   * @returns Un objet contenant le token d'accès et les informations de l'utilisateur nouvellement créé
   * @throws BadRequestException (HTTP 400) si l'email ou le numéro de téléphone est déjà utilisé, ou si une erreur survient lors de la création du compte
   */
  async createNewAccount(newPatientDto: NewPatientDto) {
    const age = Math.floor((new Date().getTime() - new Date(newPatientDto.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25));

    try {
      console.log('Création d\'un nouveau compte pour:', newPatientDto.email);

      const user = await this.prisma.user.create({
        data: {
          firstName: newPatientDto.firstName,
          lastName: newPatientDto.lastName,
          email: newPatientDto.email,
          password: await bcrypt.hash(newPatientDto.password, 10),
          phone: newPatientDto.phone,
          role: 'PATIENT',
          patient: {
            create: {
              age: age,
              gender: newPatientDto.gender,
              birthDate: newPatientDto.birthDate,
              address: newPatientDto.address,
              intern: false,
              medicalRecord: {
                create: {
                }
              }
            }
          }
        }
      });

      if (!user) {
        throw new BadRequestException('utilisateur introuvable après la création du compte');
      }

      console.log('Compte créé avec succès pour:', user);

      console.log('phone:', user.phone);

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
    catch (error) {

      console.error('Erreur lors de la création du compte:', error);
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException('Un compte avec cet email ou ce numéro de téléphone existe déjà.');
      }
      throw new BadRequestException('Erreur lors de la création du compte');
    }
  }
}