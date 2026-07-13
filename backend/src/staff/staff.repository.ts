import { Injectable } from '@nestjs/common';
import { Prisma, Role } from '.prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const staffInclude = {
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      userStatus: true,
    },
  },
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
} as const;

@Injectable()
export class StaffRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(where: Prisma.MedicalStaffWhereInput) {
    return this.prisma.medicalStaff.findMany({
      where,
      include: staffInclude,
    });
  }

  findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  findUserByActivationToken(activationToken: string) {
    return this.prisma.user.findUnique({
      where: { activationToken },
      include: {
        medicalStaff: true,
      },
    });
  }

  findUserById(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        medicalStaff: true,
      },
    });
  }

  createStaffMember(data: Prisma.UserCreateArgs['data']) {
    return this.prisma.user.create({
      data,
    });
  }

  updateUserById(userId: number, data: Prisma.UserUpdateArgs['data']) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  findUserByIdAndEmail(userId: number, email: string) {
    return this.prisma.user.findFirst({
      where: { id: userId, email },
    });
  }

  findStaffForAssignment(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        medicalStaff: true,
      },
    });
  }

  assignStaffMember(userId: number, data: Prisma.UserUpdateArgs['data']) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      include: {
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
      },
    });
  }
}