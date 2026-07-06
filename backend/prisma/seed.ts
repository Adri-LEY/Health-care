import { PrismaClient, Role, BloodType, Imc, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log(' Début du seeding basé sur le schéma réel et sécurisé...');

  // ==========================================
  // 1. NETTOYAGE DE LA BASE (Ordre strict des FK)
  // ==========================================
  await prisma.doctor.deleteMany({});
  await prisma.nurseAssistant.deleteMany({});
  await prisma.medicalStaff.deleteMany({});
  await prisma.patient.deleteMany({});
  await prisma.administrator.deleteMany({});
  
  // Maintenant on peut vider les tables parentes et annexes
  await prisma.medicalRecord.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.specialty.deleteMany({});
  await prisma.service.deleteMany({});

  const tables = ['User', 'Patient', 'MedicalStaff', 'Doctor', 'NurseAssistant', 'Administrator', 'Specialty', 'Service', 'MedicalRecord'];
  
  for (const table of tables) {
    // Sous PostgreSQL, le nom de la séquence générée par Prisma est généralement "NomDeLaTable_id_seq"
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE "${table}_id_seq" RESTART WITH 1;`);
  }

  // ==========================================
  // 2. CRÉATION DES DONNÉES ANNEXES (Spécialités & Services)
  // ==========================================
  const cardiology = await prisma.specialty.create({
    data: { specialtyName: 'Cardiologie' },
  });
  const generalMedicine = await prisma.specialty.create({
    data: { specialtyName: 'Médecine Générale' },
  });

  const urgencesService = await prisma.service.create({
    data: { serviceName: 'Urgences' },
  });
  const gériatrieService = await prisma.service.create({
    data: { serviceName: 'Gériatrie' },
  });

  // Hachage du mot de passe commun
  const hashedPassword = await bcrypt.hash('Password123*', 10);

  // ==========================================
  // 3. CRÉATION DU PATIENT
  // ==========================================
  await prisma.user.create({
    data: {
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'patient@test.com',
      password: hashedPassword,
      role: Role.PATIENT,
      userStatus: UserStatus.ACTIVE, // Forcer le compte à être actif
      patient: {
        create: {
          age: 35,
          gender: 'M',
          birthDate: new Date('1991-05-12'),
          address: '123 Rue de la Paix, Paris',
          intern: false,
          medicalRecord: {
            create: {
              poids: 75.5,
              taille: 1.80,
              bloodType: BloodType.A,
              imc: Imc.NORMAL_WEIGHT,
              medical_history: 'Aucun antécédent majeur.',
              family_history: 'Hypertension côté paternel.',
              allergies: 'Pénicilline',
            },
          },
        },
      },
    },
  });

  // ==========================================
  // 4. CRÉATION DES MÉDECINS (DOCTOR)
  // ==========================================
  // Médecin 1 : Sarah Connor
  await prisma.user.create({
    data: {
      firstName: 'Sarah',
      lastName: 'Connor',
      email: 'doctor@test.com',
      phone: '+33612345678',
      password: hashedPassword,
      role: Role.DOCTOR,
      userStatus: UserStatus.ACTIVE, // Forcer le compte à être actif
      medicalStaff: {
        create: {
          staffNumber: 8877, // Note : le champ "status" local a disparu, c'est géré globalement par le UserStatus du dessus
          doctor: {
            create: {
              registrationId: 'MED-REG-999',
              specialtyId: cardiology.id,
            },
          },
        },
      },
    },
  });

  // Médecin 2 : Gregory House
  await prisma.user.create({
    data: {
      firstName: 'Gregory',
      lastName: 'House',
      email: 'house@test.com',
      phone: '+33622345678',
      password: hashedPassword,
      role: Role.DOCTOR,
      userStatus: UserStatus.ACTIVE, // Forcer le compte à être actif
      medicalStaff: {
        create: {
          staffNumber: 8878,
          doctor: {
            create: {
              registrationId: 'MED-REG-777',
              specialtyId: generalMedicine.id,
            },
          },
        },
      },
    },
  });

  // ==========================================
  // 5. CRÉATION DES AIDES-SOIGNANTS (NURSE_ASSISTANT)
  // ==========================================
  // Aide-soignant 1
  await prisma.user.create({
    data: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'nurse1@test.com',
      phone: '+33633345678',
      password: hashedPassword,
      role: Role.NURSE_ASSISTANT,
      userStatus: UserStatus.ACTIVE, // Forcer le compte à être actif
      medicalStaff: {
        create: {
          staffNumber: 4411,
          nurseAssistant: {
            create: {
              registrationId: 'NURSE-REG-111',
              serviceId: urgencesService.id,
            },
          },
        },
      },
    },
  });

  // Aide-soignant 2
  await prisma.user.create({
    data: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'nurse2@test.com',
      phone: '+33644345678',
      password: hashedPassword,
      role: Role.NURSE_ASSISTANT,
      userStatus: UserStatus.ACTIVE, // Forcer le compte à être actif
      medicalStaff: {
        create: {
          staffNumber: 4412,
          nurseAssistant: {
            create: {
              registrationId: 'NURSE-REG-222',
              serviceId: gériatrieService.id,
            },
          },
        },
      },
    },
  });

  // ==========================================
  // 6. CRÉATION DE L'ADMINISTRATEUR
  // ==========================================
  await prisma.user.create({
    data: {
      firstName: 'Boss',
      lastName: 'Admin',
      email: 'admin@test.com',
      phone: '+33600000000',
      password: hashedPassword,
      role: Role.ADMINISTRATOR,
      userStatus: UserStatus.ACTIVE, // Forcer le compte à être actif
      activationToken: "test",
      administrator: {
        create: {
          position: 'Directeur des Ressources Humaines',
        },
      },
    },
  });

  console.log('✅ Seeding terminé avec succès et tous les comptes sont ACTIVE !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });