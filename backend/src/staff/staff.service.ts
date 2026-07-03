import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Role } from '.prisma/client';

@Injectable()
export class StaffService {

  constructor(private prisma: PrismaService) {}

  async getAllStaff(roles?: Role[], specialtyId?: number[], serviceId?: number[]) {
    const whereConditions : Prisma.MedicalStaffWhereInput = {};

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
      return await this.prisma.medicalStaff.findMany({
        where: whereConditions,
        include: {
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
          doctor: {
            include: {
              specialty: true, // Charge l'objet Specialty complet (id + specialtyName)
            },
          },
          nurseAssistant: {
            include: {
              service: true, // Charge l'objet Service complet (id + serviceName)
            },
          },
        },
      });
    } catch (error) {
      console.error('Error fetching staff:', error);
      throw new Error('Could not fetch staff');
    }
  }
}