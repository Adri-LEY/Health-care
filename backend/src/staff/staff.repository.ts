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


const doctorInclude = {
  user: {
    select: {
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
    },
  },
  doctor: {
    select: {
      id: true,
      specialty: true,
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

  findAllDoctors(where: Prisma.DoctorWhereInput) {
    return this.prisma.medicalStaff.findMany({
      where: {
        doctor: where,
      },
      include: doctorInclude,
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

  async getStaffStats() {
    const globalResult = await this.prisma.$queryRaw<any[]>`
      SELECT
        (SELECT COUNT(*) FROM "User" WHERE "role" IN ('DOCTOR', 'NURSE_ASSISTANT', 'ADMINISTRATOR')) AS "totalStaff",
        (SELECT COUNT(*) FROM "User" WHERE "role" = 'DOCTOR') AS "doctors",
        (SELECT COUNT(*) FROM "User" WHERE "role" = 'NURSE_ASSISTANT') AS "nurses",
        (SELECT COUNT(*) FROM "User" WHERE "role" = 'ADMINISTRATOR') AS "administrators"
    `;

    const groupedBySpecialtyResult = await this.prisma.$queryRaw<any[]>`
      SELECT
        s."specialtyName",
        COUNT(d."id") AS "doctorCount"
      FROM "Doctor" d
      JOIN "Specialty" s ON d."specialtyId" = s."id"
      GROUP BY s."specialtyName"
      ORDER BY "doctorCount" DESC;
    `;

    return {
      totalStaff: Number(globalResult[0]?.totalStaff ?? 0),
      doctors: Number(globalResult[0]?.doctors ?? 0),
      nurses: Number(globalResult[0]?.nurses ?? 0),
      administrators: Number(globalResult[0]?.administrators ?? 0),
      
      groupedBySpecialty: groupedBySpecialtyResult.map((item) => ({
        ...item,
        doctorCount: Number(item.doctorCount),
      })),
    };
  }
}