import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SpecialtyService {

    constructor(private prisma: PrismaService) {}

    getAllSpecialties() {
        try {
            return this.prisma.specialty.findMany();
        } catch (error) {
            console.error('Error fetching specialties:', error);
            throw new Error('Could not fetch specialties');
        }
    }
}
