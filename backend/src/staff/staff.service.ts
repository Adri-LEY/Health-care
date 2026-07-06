import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Role } from '.prisma/client';
import { NewStaffMemberDto } from './dto/newStaffMember.dto';
import { MailerService } from '@nestjs-modules/mailer';
import {UserStatus} from '@prisma/client';
import { ActivateStaffAccountDto } from './dto/activateStaffAccount.dto';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { UpdateStaffMemberStatusDto } from './dto/updateStaffMemberStatus.dto';
import { ResendActivationTokenDto } from './dto/resendActivationToken.dto';


@Injectable()
export class StaffService {

  constructor(private prisma: PrismaService,
    private mailerService: MailerService,
    private jwtService: JwtService
  ) { }

  /**
   * Retrieves all staff members based on the provided criteria.
   * @param roles 
   * @param specialtyId 
   * @param serviceId 
   * @returns A promise resolving to the list of staff members.
   * @throws InternalServerErrorException if there is an error during retrieval.
   */
  async getAllStaff(roles?: Role[], specialtyId?: number[], serviceId?: number[]) {
    const whereConditions: Prisma.MedicalStaffWhereInput = {};

    if (roles && roles.length > 0) {
      whereConditions.user = { role: { in: roles } };
    }

    if (specialtyId && specialtyId.length > 0) {
      whereConditions.doctor = { specialtyId: { in: specialtyId } };
    }

    if (serviceId && serviceId.length > 0) {
      whereConditions.nurseAssistant = { serviceId: { in: serviceId } };
    }

    try {
      return await this.prisma.medicalStaff.findMany({
        where: whereConditions,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              role: true,
            },
          },
          doctor: {
            include: {
              specialty: true, // Charge l'objet Specialty complet (id + specialtyName)
            },
          },
          nurseAssistant: {
            include: {
              service: true, // Charge l'objet Service complet (id + serviceName)
            },
          },
        },
      });
    } catch (error) {
      console.error('Error fetching staff:', error);
      throw new InternalServerErrorException('Could not fetch staff');
    }
  }


  /**
   * Creates a new staff member.
   * @param newStaffMember The data for the new staff member.
   * @returns A promise resolving to the created staff member.
   * @throws ConflictException if a user with the same email already exists.
   * @throws InternalServerErrorException if there is an error during creation.
   */
  async createNewStaffMember(newStaffMember: NewStaffMemberDto) {
    try {
      const userExists = await this.prisma.user.findUnique({
        where: { email: newStaffMember.email },
      });

      if(userExists) {
        throw new ConflictException('A user with this email already exists');
      }

      const activationToken = crypto.randomBytes(32).toString('hex');

      const createdStaff = await this.prisma.user.create({
        data: {
          firstName: newStaffMember.firstName,
          lastName: newStaffMember.lastName,
          email: newStaffMember.email,
          phone: newStaffMember.phone,
          role: newStaffMember.role as Role,
          userStatus: 'PENDING', // On active le compte dès sa création
          activationToken: activationToken,
          tokenExpiresAt: new Date(Date.now() + 30 * 1000), // Token valable 30s
          medicalStaff: {
            create: {
              staffNumber: newStaffMember.staffNumber,
              doctor: newStaffMember.role === 'DOCTOR' ? {
                create: {
                  registrationId: newStaffMember.registrationId,
                  specialtyId: newStaffMember.specialtyId!,
                },
              } : undefined,
              nurseAssistant: newStaffMember.role === 'NURSE_ASSISTANT' ? {
                create: {
                  registrationId: newStaffMember.registrationId,
                  serviceId: newStaffMember.serviceId!,
                },
              } : undefined,
            },
          },
        },
      });

      await this.mailerService.sendMail({
        to: newStaffMember.email,
        subject: 'Activation de votre compte',
        html: `<p>Bonjour ${newStaffMember.firstName},</p>
        <p>Votre compte a été créé avec succès. Veuillez cliquer sur le lien ci-dessous pour activer votre compte :</p>
        <a href="http://localhost:3000/activate-account?token=${activationToken}">Activer mon compte</a>
        <p>Merci,</p>
        <p>L'équipe de gestion des comptes.</p>`,
      });



      return createdStaff;
    } catch (error) {
      console.error('Error creating staff:', error);
      throw error;
    }
  }

  /**
   * Activates a staff member's account using the provided activation token and password.
   * @param activateNewStaffAccountDto 
   * @returns Information about the activated staff member.
   * @throws NotFoundException if the activation token is invalid.
   * @throws BadRequestException if the activation token has expired.
   */
  async activateStaffMember(activateNewStaffAccountDto: ActivateStaffAccountDto) {
    try {
      const staffUser = await this.prisma.user.findUnique({
        where: { activationToken: activateNewStaffAccountDto.activationToken },
        include: {
          medicalStaff: true, // Inclut les informations du personnel médical
        },
      });

      if (!staffUser) throw new NotFoundException('Invalid activation token');

      const now = new Date();
      if(staffUser.tokenExpiresAt && staffUser.tokenExpiresAt < now) {
        throw new BadRequestException('Activation token has expired');
      }

      const hashedPassword = bcrypt.hashSync(activateNewStaffAccountDto.password, 10);
      const updatedStaff = await this.prisma.user.update({
        where: { activationToken: activateNewStaffAccountDto.activationToken },
        data: { 
          password: hashedPassword,
          userStatus: UserStatus.ACTIVATED,
          activationToken: null, // Supprime le token après activation
          tokenExpiresAt: null, // Supprime la date d'expiration après activation
        },
      });

      const payload = {
        id: updatedStaff.id,
        lastName: updatedStaff.lastName,
        firstName: updatedStaff.firstName,
        email: updatedStaff.email,
        phone: updatedStaff.phone,
        role: updatedStaff.role,
        createdAt: updatedStaff.createdAt,
        userStatus: updatedStaff.userStatus,
      };

      return payload;
    } catch (error) {
      console.error('Error activating staff member:', error);
      throw error;
    }
  }


  /**
   * Resends an activation token to a staff member.
   * @param email 
   * @returns A message indicating that the activation token has been resent.
   * @throws NotFoundException if the user is not found.
   * @throws BadRequestException if the account is already activated. 
   */
  async resendStaffActivationToken(resendActivationTokenDto: ResendActivationTokenDto) {
    try {
      const staffUser = await this.prisma.user.findUnique({
        where: { id: resendActivationTokenDto.userId,
          email: resendActivationTokenDto.email },
      });

      if (!staffUser) throw new NotFoundException('User not found');

      if (staffUser.userStatus === UserStatus.ACTIVATED) {
        throw new BadRequestException('Account is already activated');
      }

      const newActivationToken = crypto.randomBytes(32).toString('hex');
      const tokenExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // Token valable 48h

      await this.prisma.user.update({
        where: { email: resendActivationTokenDto.email },
        data: {
          activationToken: newActivationToken,
          tokenExpiresAt: tokenExpiresAt,
        },
      });

      await this.mailerService.sendMail({
        to: resendActivationTokenDto.email,
        subject: 'Activation de votre compte - Nouveau lien',
        html: `<p>Bonjour,</p>
        <p>Un nouveau lien d'activation vient d'être généré pour votre compte. Veuillez cliquer sur le lien ci-dessous pour activer votre compte :</p>
        <a href="http://localhost:3000/activate-account?token=${newActivationToken}">Activer mon compte</a>`
      });

      return { message: 'Activation token resent successfully' };
    } catch (error) {
      console.error('Error resending activation token:', error);
      throw error;
    }
  }

  /**
   * Updates a staff member's status.
   * @param staffId 
   * @param status 
   * @returns Information about the updated staff member.
   * @throws NotFoundException if the staff member is not found.
   * @throws BadRequestException if the account is still pending.
   */
  async updateStaffMemberStatus(updateStaffMemberStatusDto: UpdateStaffMemberStatusDto) {
  
    try {
      const updatedStaff = await this.prisma.user.update({
        where: { id: updateStaffMemberStatusDto.userId },
        data: { userStatus: updateStaffMemberStatusDto.status as UserStatus },
      });

      if(updatedStaff.userStatus === UserStatus.PENDING) throw new BadRequestException('The Account is still pending');

      const payload = {
        id: updatedStaff.id,
        lastName: updatedStaff.lastName,
        firstName: updatedStaff.firstName,
        email: updatedStaff.email,
        phone: updatedStaff.phone,
        role: updatedStaff.role,
        createdAt: updatedStaff.createdAt,
        userStatus: updatedStaff.userStatus,
      };

      return payload;
    }
    catch (error) {
      console.error('Error updating staff member status:', error);
      throw error;
    }
  }
}