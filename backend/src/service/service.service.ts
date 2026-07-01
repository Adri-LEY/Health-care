import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ServiceService {

    constructor(private prisma: PrismaService) {}

    getAllServices() {
        try {
            return this.prisma.service.findMany();
        } catch (error) {
            console.error('Error fetching services:', error);
            throw new Error('Could not fetch services');
        }
    }
}
