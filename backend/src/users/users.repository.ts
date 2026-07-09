import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const profileInclude = {
  patient: true,
  administrator: true,
  medicalStaff: {
    include: {
      doctor: {
        include: {
          specialty: true,
        },
      },
      nurseAssistant: {
        include: {
          service: true,
        },
      },
    },
  },
} as const;

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findProfileById(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: profileInclude,
    });
  }

  findUserById(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  updateBasicProfile(userId: number, data: { firstName?: string; lastName?: string; email?: string; phone?: string; }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      include: profileInclude,
    });
  }

  updatePatientAddress(userId: number, address: string) {
    return this.prisma.patient.update({
      where: { userId },
      data: { address },
    });
  }

  updatePassword(userId: number, hashedPassword: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }
}