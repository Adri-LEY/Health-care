import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Ajuste le chemin
import { UserStatus } from '@prisma/client';

@Injectable()
export class UserStatusGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Récupéré au préalable par ton JwtAuthGuard

    if (!user || !user.id) {
      throw new UnauthorizedException("Utilisateur non authentifié.");
    }

    // On va chercher le statut en temps réel dans la base de données
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { userStatus: true }
    });

    if (!dbUser || dbUser.userStatus !== UserStatus.ACTIVE) {
      throw new UnauthorizedException("Ce compte est désactivé ou en attente d'activation.");
    }

    return true;
  }
}