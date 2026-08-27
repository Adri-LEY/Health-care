import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // Ajuste le chemin

@Injectable()
export class PrescriptionCatalogService {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // 1. MÉDICAMENTS
  // ==========================================
  async findAllMedications() {
    return await this.prisma.medication.findMany();
  }

  async findOneMedication(id: number) {
    const item = await this.prisma.medication.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Médicament ID ${id} introuvable.`);
    return item;
  }


  // ==========================================
  // 2. ÉQUIPEMENTS
  // ==========================================
  async findAllEquipments() {
    return await this.prisma.medicalEquipment.findMany();
  }

  async findOneEquipment(id: number) {
    const item = await this.prisma.medicalEquipment.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Équipement ID ${id} introuvable.`);
    return item;
  }


  // ==========================================
  // 3. SOINS PARAMÉDICAUX
  // ==========================================
  async findAllCares() {
    return await this.prisma.paramedicalCare.findMany();
  }

  async findOneCare(id: number) {
    const item = await this.prisma.paramedicalCare.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Soin paramédical ID ${id} introuvable.`);
    return item;
  }

}