import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/updateProfile.dto';
import { UpdatePasswordDto } from './dto/updatePassword.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {

  constructor(private readonly prisma: PrismaService) { }

  /**
   * Récupère les informations du profil de l'utilisateur à partir de son ID.
   * @param userId L'ID de l'utilisateur dont on souhaite récupérer le profil
   * @returns Un objet contenant les informations du profil de l'utilisateur
   * @throws NotFoundException (HTTP 404) si l'utilisateur n'est pas trouvé
   */
  async getProfile(userId: string) {
    const id = Number(userId);

    if (Number.isNaN(id)) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        patient: true,
        administrator: true,
        medicalStaff: {
          include: {
            doctor: true,
            nurseAssistant: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException("Utilisateur introuvable");
    }

    let specialty: any = null;
    if (user.medicalStaff?.doctor?.specialtyId) {
      specialty = await this.prisma.specialty.findUnique({
        where: { id: user.medicalStaff.doctor.specialtyId },
      });
    }

    let service: any = null;
    if (user.medicalStaff?.nurseAssistant?.serviceId) {
      service = await this.prisma.service.findUnique({
        where: { id: user.medicalStaff.nurseAssistant.serviceId },
      });
    }

    // 2. On construit le payload proprement
    const payload = {
      id: user.id,
      lastName: user.lastName,
      firstName: user.firstName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
      userDetails: user.patient || user.administrator || user.medicalStaff,
      specialty: specialty, // Sera null si non applicable
      service: service, // Sera null si non applicable
    };

    return payload;
  }

  /**
   * Met à jour les informations du profil de l'utilisateur.
   * @param updateProfileDto 
   * @param userId 
   * @returns Un objet contenant les informations mises à jour du profil de l'utilisateur
   * @throws NotFoundException (HTTP 404) si l'utilisateur n'est pas trouvé
   */
  async updateProfile(updateProfileDto: UpdateProfileDto, userId: string) {
    const id = Number(userId);

    if (Number.isNaN(id)) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException("Utilisateur introuvable");
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        firstName: updateProfileDto.firstName ?? user.firstName,
        lastName: updateProfileDto.lastName ?? user.lastName,
        email: updateProfileDto.email ?? user.email,
        phone: updateProfileDto.phone ?? user.phone,
      },
      include: {
        patient: true,
        administrator: true,
        medicalStaff: {
          include: {
            doctor: true,
            nurseAssistant: true,
          },
        },
      },
    });

    let specialty: any = null;
    if (updatedUser.medicalStaff?.doctor?.specialtyId) {
      specialty = await this.prisma.specialty.findUnique({
        where: { id: updatedUser.medicalStaff.doctor.specialtyId },
      });
    }

    let service: any = null;
    if (updatedUser.medicalStaff?.nurseAssistant?.serviceId) {
      service = await this.prisma.service.findUnique({
        where: { id: updatedUser.medicalStaff.nurseAssistant.serviceId },
      });
    }

    if (user.role === 'PATIENT' && updateProfileDto.address) {
      await this.prisma.patient.update({
        where: { userId: id },
        data: {
          address: updateProfileDto.address,
        },
      });
    }

    const payload = {
      id: updatedUser.id,
      lastName: updatedUser.lastName,
      firstName: updatedUser.firstName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt,
      userDetails: updatedUser.patient || updatedUser.administrator || updatedUser.medicalStaff,
      specialty: specialty,
      service: service,
    };
    return payload;

  }

  /**
   * Met à jour le mot de passe de l'utilisateur après avoir vérifié la validité du mot de passe actuel.
   * @param userId 
   * @param updatePasswordDto 
   * @returns Un objet contenant un message de succès si le mot de passe est mis à jour avec succès
   * @throws NotFoundException (HTTP 404) si l'utilisateur n'est pas trouvé ou si le mot de passe actuel est incorrect
   */
  async updatePassword(userId: string, updatePasswordDto: UpdatePasswordDto) {
    const id = Number(userId);

    if (Number.isNaN(id)) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException("Utilisateur introuvable");
    }

    if (!bcrypt.compareSync(updatePasswordDto.currentPassword, user.password)) {
      throw new NotFoundException("Le mot de passe actuel est incorrect");
    }

    await this.prisma.user.update({
      where: { id },
      data: {
        password: bcrypt.hashSync(updatePasswordDto.newPassword, 10),
      },
    });
    return { message: "Mot de passe mis à jour avec succès" };
  }
}
