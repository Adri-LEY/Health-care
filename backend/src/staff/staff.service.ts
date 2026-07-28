import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Prisma, Role } from '.prisma/client';
import { NewStaffMemberDto } from './dto/newStaffMember.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { UserStatus } from '@prisma/client';
import { ActivateStaffAccountDto } from './dto/activateStaffAccount.dto';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { UpdateStaffMemberStatusDto } from './dto/updateStaffMemberStatus.dto';
import { ResendActivationTokenDto } from './dto/resendActivationToken.dto';
import { AssignStaffMemberDto } from './dto/assignStaffMember.dto';
import { StaffRepository } from './staff.repository';


@Injectable()
export class StaffService {

  constructor(private readonly staffRepository: StaffRepository,
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
      return await this.staffRepository.findAll(whereConditions);
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
      const userExists = await this.staffRepository.findUserByEmail(newStaffMember.email);

      if (userExists) {
        throw new ConflictException('A user with this email already exists');
      }

      const activationToken = crypto.randomBytes(32).toString('hex');

      const createdStaff = await this.staffRepository.createStaffMember({
        firstName: newStaffMember.firstName,
        lastName: newStaffMember.lastName,
        email: newStaffMember.email,
        phone: newStaffMember.phone,
        role: newStaffMember.role as Role,
        userStatus: 'PENDING', // On garde le compte en attente à sa création
        activationToken: activationToken,
        tokenExpiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // Token valable 48 heures
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
      });

      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const activationLink = `${baseUrl}/activate-account?token=${activationToken}`;

      this.mailerService.sendMail({
        to: newStaffMember.email,
        subject: 'Activation de votre compte',
        html: `<p>Bonjour ${newStaffMember.firstName},</p>
        <p>Votre compte a été créé avec succès. Veuillez cliquer sur le lien ci-dessous pour activer votre compte :</p>
        <a href="${activationLink}">Activer mon compte</a>
        <p>Merci,</p>
        <p>L'équipe de gestion des comptes.</p>`,
      })
        .catch(err => {
          console.error('Error sending activation email:', err);
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
  * @returns Information about the active staff member.
   * @throws NotFoundException if the activation token is invalid.
   * @throws BadRequestException if the activation token has expired.
   */
  async activateStaffMember(activateNewStaffAccountDto: ActivateStaffAccountDto) {
    try {
      const staffUser = await this.staffRepository.findUserByActivationToken(activateNewStaffAccountDto.activationToken);

      if (!staffUser) throw new NotFoundException('Invalid activation token');

      const now = new Date();
      if (staffUser.tokenExpiresAt && staffUser.tokenExpiresAt < now) {
        throw new BadRequestException('Activation token has expired');
      }

      const hashedPassword = bcrypt.hashSync(activateNewStaffAccountDto.password, 10);
      const updatedStaff = await this.staffRepository.updateUserById(staffUser.id, {
        password: hashedPassword,
        userStatus: UserStatus.ACTIVE,
        activationToken: null,
        tokenExpiresAt: null,
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
  * @throws BadRequestException if the account is already active.
   */
  async resendStaffActivationToken(resendActivationTokenDto: ResendActivationTokenDto) {
    try {
      const staffUser = await this.staffRepository.findUserByIdAndEmail(
        resendActivationTokenDto.userId,
        resendActivationTokenDto.email,
      );

      if (!staffUser) throw new NotFoundException('User not found');

      if (staffUser.userStatus === UserStatus.ACTIVE) {
        throw new BadRequestException('Account is already active');
      }

      const newActivationToken = crypto.randomBytes(32).toString('hex');
      const tokenExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // Token valable 48h

      await this.staffRepository.updateUserById(resendActivationTokenDto.userId, {
        activationToken: newActivationToken,
        tokenExpiresAt,
      });

      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const activationLink = `${baseUrl}/activate-account?token=${newActivationToken}`;

      this.mailerService.sendMail({
        to: resendActivationTokenDto.email,
        subject: 'Activation de votre compte - Nouveau lien',
        html: `<p>Bonjour,</p>
        <p>Un nouveau lien d'activation vient d'être généré pour votre compte. Veuillez cliquer sur le lien ci-dessous pour activer votre compte :</p>
        <a href="${activationLink}">Activer mon compte</a>`
      })
        .catch(err => {
          console.error('Error sending activation email:', err)
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
      const updatedStaff = await this.staffRepository.updateUserById(updateStaffMemberStatusDto.userId, { userStatus: updateStaffMemberStatusDto.status as UserStatus });

      if (updatedStaff.userStatus === UserStatus.PENDING) throw new BadRequestException('The Account is still pending');

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



  async setSpecialtyForDoctor(assignStaffMemberDto: AssignStaffMemberDto) {
    try {
      const updateData: any = {};

      const user = await this.staffRepository.findStaffForAssignment(assignStaffMemberDto.userId);

      if (!user) {
        throw new NotFoundException(`User with ID ${assignStaffMemberDto.userId} not found`);
      }

      if(user.role !== Role.DOCTOR && user.role !== Role.NURSE_ASSISTANT) {
        throw new BadRequestException('User must be either a doctor or a nurse assistant to assign a specialty or service.');
      }

      if (user.role === Role.DOCTOR && assignStaffMemberDto.serviceId) {
        throw new BadRequestException('Cannot assign a service to a doctor. Please provide a specialty ID instead.');
      }

      if (user.role === Role.NURSE_ASSISTANT && assignStaffMemberDto.specialtyId) {
        throw new BadRequestException('Cannot assign a specialty to a nurse assistant. Please provide a service ID instead.');
      }

      if (assignStaffMemberDto.specialtyId) {
        updateData.medicalStaff = {
          update: {
            doctor: {
              update: {
                specialtyId: assignStaffMemberDto.specialtyId,
              },
            },
          },
        };
      }
      else if (assignStaffMemberDto.serviceId) {
        updateData.medicalStaff = {
          update: {
            nurseAssistant: {
              update: {
                serviceId: assignStaffMemberDto.serviceId,
              },
            },
          },
        };
      }

      const staffUser = await this.staffRepository.assignStaffMember(assignStaffMemberDto.userId, updateData);

      return staffUser;
    } catch (error) {
      console.error('Error setting specialty for doctor:', error);
      throw error;
    }
  }

  /**
   * Retrieves the doctor ID associated with a given user ID.
   * @param userId 
   * @returns The doctor ID if found, otherwise null.
   * @throws NotFoundException if the user is not found.
   */
  getDoctorProfileById(userId: number) {
    try {
      return this.staffRepository.getDoctorProfileById(userId);
    } catch (error) {
      console.error('Error retrieving doctor profile:', error);
      throw new NotFoundException(`Doctor profile for user ID ${userId} not found`);
    }
  }
}