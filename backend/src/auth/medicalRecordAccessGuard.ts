// src/consultations/guards/medical-record-access.guard.ts

import { 
  CanActivate, 
  ExecutionContext, 
  Injectable, 
  ForbiddenException, 
  NotFoundException 
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // Ajustez le chemin vers votre PrismaService

@Injectable()
export class MedicalRecordAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Injecté au préalable par votre JwtAuthGuard
    const medicalRecordIdStr = request.params.medicalRecordId;

    if (!user) {
      throw new ForbiddenException("Utilisateur non authentifié.");
    }

    const medicalRecordId = parseInt(medicalRecordIdStr, 10);
    if (isNaN(medicalRecordId)) {
      throw new ForbiddenException("Identifiant de dossier médical invalide.");
    }

    // RÈGLE 1 : Si c'est un médecin, on autorise l'accès direct
    if (user.role === 'DOCTOR') {
      return true;
    }

    // RÈGLE 2 : Si c'est un patient, on vérifie que le dossier lui appartient
    if (user.role === 'PATIENT') {
      const record = await this.prisma.medicalRecord.findUnique({
        where: { id: medicalRecordId },
        select: {
          patient: {
            select: {
              userId: true, // ID de l'User lié au Patient
            },
          },
        },
      });

      if (!record) {
        throw new NotFoundException("Dossier médical introuvable.");
      }

      // On vérifie si l'ID de l'utilisateur connecté correspond à l'utilisateur du dossier
      if (record.patient?.userId !== user.id) {
        throw new ForbiddenException("Vous n'êtes pas autorisé à consulter cet historique.");
      }

      return true;
    }

    // Par sécurité, on bloque tout autre rôle non configuré
    throw new ForbiddenException("Accès refusé pour ce profil.");
  }
}