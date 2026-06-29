import { PrismaClient, Role, BloodType, Imc } from '../generated/prisma';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// 1. On crée une connexion PostgreSQL classique avec la variable d'environnement
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 2. On transforme cette connexion en adaptateur Prisma v7
const adapter = new PrismaPg(pool);

// 3. On donne cet adaptateur au constructeur de Prisma
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Début du seeding...');

  // 1. On nettoie la base pour éviter les doublons si on re-lance le script
  // Note : Supprimer User cascade la suppression vers Patient, mais pas vers MedicalRecord (à cause de Restrict)
  // On vide donc d'abord les dossiers médicaux, puis les utilisateurs.
  await prisma.user.deleteMany({});
  await prisma.specialty.deleteMany({});
  await prisma.medicalRecord.deleteMany({});

  // 2. On crée une spécialité pour notre médecin
  const cardiology = await prisma.specialty.create({
    data: { specialtyName: 'Cardiologie' },
  });

  // 3. Hachage du mot de passe commun pour nos tests ("Password123*")
  const hashedPassword = await bcrypt.hash('Password123*', 10);

  // 4. Création d'un PATIENT de test AVEC son dossier médical obligatoire
  await prisma.user.create({
    data: {
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'patient@test.com',
      password: hashedPassword,
      role: Role.PATIENT,
      patient: {
        create: {
          age: 35,
          gender: 'M',
          birthDate: new Date('1991-05-12'),
          address: '123 Rue de la Paix, Paris',
          intern: false,
          // Création imbriquée du dossier médical obligatoire
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

  // 5. Création d'un DOCTEUR de test
  await prisma.user.create({
    data: {
      firstName: 'Sarah',
      lastName: 'Connor',
      email: 'doctor@test.com',
      phone: '+33612345678',
      password: hashedPassword,
      role: Role.DOCTOR,
      medicalStaff: {
        create: {
          staffNumber: 8877,
          doctor: {
            create: {
              registrationId: 'MED-REG-999',
              specialtyId: cardiology.id, // On le lie à la cardiologie créée au-dessus
            },
          },
        },
      },
    },
  });

  console.log('✅ Seeding terminé avec succès !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });