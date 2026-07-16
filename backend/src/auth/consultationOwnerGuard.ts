// src/auth/consultationOwnerGuard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // Ajustez le chemin

@Injectable()
export class ConsultationOwnerGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Injecté préalablement par le JwtGuard
    const consultationId = Number(request.params.consultationId);

    if (isNaN(consultationId)) {
      throw new ForbiddenException('ID de consultation invalide');
    }

    // 1. Les rôles médicaux ont un accès global
    if (user.role === 'DOCTOR' || user.role === 'NURSE_ASSISTANT') {
      return true;
    }

    // 2. Si c'est un patient, on vérifie s'il est le propriétaire
    if (user.role === 'PATIENT') {
      // On cherche la consultation et le lien avec le patient
      const consultation = await this.prisma.consultation.findUnique({
        where: { id: consultationId },
        select: {
          medicalRecord: {
            select: {
              patient: {
                select: {
                  userId: true // ID de l'utilisateur lié au patient
                }
              }
            }
          }
        }
      });

      if (!consultation) {
        throw new NotFoundException('Consultation introuvable');
      }

      // On vérifie si l'ID de l'utilisateur connecté correspond à l'ID de l'utilisateur propriétaire du dossier
      const ownerId = consultation.medicalRecord.patient?.userId;
      if (ownerId !== user.patientId) {
        throw new ForbiddenException("Vous n'êtes pas autorisé à consulter cette ressource.");
      }

      return true;
    }

    return false;
  }
}