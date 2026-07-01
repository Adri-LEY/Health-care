import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Role } from '.prisma/client';

@Injectable()
export class StaffService {

  constructor(private prisma: PrismaService) {}

  async getAllStaff(role?: Role, specialtyId?: number, serviceId?: number) {
    const whereConditions : Prisma.MedicalStaffWhereInput = {};

    if (role) {
      whereConditions.user = { role: role };
    }

    if (specialtyId) {
      whereConditions.doctor = { specialtyId: specialtyId };
    }

    if (serviceId) {
      whereConditions.nurseAssistant = { serviceId: serviceId };
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