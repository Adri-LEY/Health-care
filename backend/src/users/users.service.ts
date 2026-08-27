import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateProfileDto } from './dto/updateProfile.dto';
import { UpdatePasswordDto } from './dto/updatePassword.dto';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {

  constructor(private readonly usersRepository: UsersRepository) { }

  private buildProfilePayload(user: any) {
    return {
      id: user.id,
      lastName: user.lastName,
      firstName: user.firstName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
      userDetails: user.patient || user.administrator || user.medicalStaff,
      specialty: user.medicalStaff?.doctor?.specialty ?? null,
      service: user.medicalStaff?.nurseAssistant?.service ?? null,
    };
  }

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

    const user = await this.usersRepository.findProfileById(id);

    if (!user) {
      throw new NotFoundException("Utilisateur introuvable");
    }

    return this.buildProfilePayload(user);
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

    const user = await this.usersRepository.findUserById(id);

    if (!user) {
      throw new NotFoundException("Utilisateur introuvable");
    }

    await this.usersRepository.updateBasicProfile(id, {
      firstName: updateProfileDto.firstName ?? user.firstName,
      lastName: updateProfileDto.lastName ?? user.lastName,
      email: updateProfileDto.email ?? user.email,
      phone: updateProfileDto.phone ?? user.phone ?? undefined,
    });

    if (user.role === 'PATIENT' && updateProfileDto.address) {
      await this.usersRepository.updatePatientAddress(id, updateProfileDto.address);
    }

    return this.getProfile(userId);

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

    const user = await this.usersRepository.findUserById(id);

    if (!user) {
      throw new NotFoundException("Utilisateur introuvable");
    }

    if (!user.password) {
      throw new NotFoundException("Aucun mot de passe défini pour cet utilisateur");
    }

    if (!bcrypt.compareSync(updatePasswordDto.currentPassword, user.password)) {
      throw new NotFoundException("Le mot de passe actuel est incorrect");
    }

    await this.usersRepository.updatePassword(id, bcrypt.hashSync(updatePasswordDto.newPassword, 10));
    return { message: "Mot de passe mis à jour avec succès" };
  }
}
