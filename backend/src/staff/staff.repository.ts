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
  constructor(private readonly prisma: PrismaService) { }

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

  /**
   * Retrieves the doctor ID associated with a user ID
   * @param userId 
   * @returns The doctor ID if found, otherwise null (returns a number or null)
   */
  getDoctorIdByUserId(userId: number) {
    const result = this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        medicalStaff: {
          select: {
            doctor: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    return result.then(user => user?.medicalStaff?.doctor?.id || null);
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


  /**
   * Retrieves the profile of a doctor by their ID
   * @param doctorId 
   * @returns The doctor's profile including user information and specialty
   */
  async getDoctorProfileById(doctorId: number) {
    return await this.prisma.doctor.findUnique({
      where: { id: doctorId },
      select: {
        id: true,
        specialty: {
          select: {
            specialtyName: true,
          },
        },
        staff: {
          select: {
            id: true,
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
          },
        },
      },
    });
  }
}