import { PrismaClient, Role, BloodType, Imc, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🚀 Début du seeding basé sur le schéma réel et sécurisé...');

  // ==========================================
  // 1. NETTOYAGE DE LA BASE (Ordre strict des FK)
  // ==========================================
  console.log('🧹 Nettoyage des tables existantes...');
  await prisma.patient.deleteMany({});
  await prisma.doctor.deleteMany({});
  await prisma.nurseAssistant.deleteMany({});
  await prisma.medicalStaff.deleteMany({});
  await prisma.administrator.deleteMany({});

  // Vider les tables parentes et annexes
  await prisma.medicalRecord.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.specialty.deleteMany({});
  await prisma.service.deleteMany({});

  const tables = ['User', 'Patient', 'MedicalStaff', 'Doctor', 'NurseAssistant', 'Administrator', 'Specialty', 'Service', 'MedicalRecord'];

  for (const table of tables) {
    // Sous PostgreSQL, réinitialisation des incréments d'ID (séquences)
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE "${table}_id_seq" RESTART WITH 1;`);
  }

  // ==========================================
  // 2. CRÉATION DES DONNÉES ANNEXES (Spécialités & Services)
  // ==========================================
  console.log('📦 Création des spécialités et des services...');
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

  // Hachage du mot de passe commun pour les utilisateurs de test
  const hashedPassword = await bcrypt.hash('Password123*', 10);

  // ==========================================
  // 3. CRÉATION DES PATIENTS
  // ==========================================
  console.log('👥 Création des patients de test...');

  const patientsData = [
    {
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'patient@test.com',
      phone: '+33611111111',
      password: hashedPassword,
      role: Role.PATIENT,
      userStatus: UserStatus.ACTIVE,
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
    {
      // Homonyme de Jean Dupont pour tester la recherche par date de naissance
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont.bis@test.com',
      phone: '+33622222222',
      password: hashedPassword,
      role: Role.PATIENT,
      userStatus: UserStatus.ACTIVE,
      patient: {
        create: {
          age: 68,
          gender: 'M',
          birthDate: new Date('1958-11-23'),
          address: '45 Avenue de la République, Lyon',
          intern: true,
          medicalRecord: {
            create: {
              poids: 88.0,
              taille: 1.72,
              bloodType: BloodType.O,
              imc: Imc.OVERWEIGHT,
              medical_history: 'Diabète de type 2.',
              family_history: 'AVC chez la mère.',
              allergies: 'Aucune',
            },
          },
        },
      },
    },
    {
      // Patiente pour tester les requêtes sur le prénom "Pat..." ou le téléphone
      firstName: 'Patricia',
      lastName: 'Martinez',
      email: 'pat.martinez@test.com',
      phone: '+33699999999',
      password: hashedPassword,
      role: Role.PATIENT,
      userStatus: UserStatus.ACTIVE,
      patient: {
        create: {
          age: 29,
          gender: 'F',
          birthDate: new Date('1997-03-15'),
          address: '8 Rue du Palais, Nice',
          intern: false,
          medicalRecord: {
            create: {
              poids: 62.1,
              taille: 1.68,
              bloodType: BloodType.B,
              imc: Imc.NORMAL_WEIGHT,
              medical_history: 'Asthme chronique.',
              family_history: 'Aucun.',
              allergies: 'Pollen, Acariens',
            },
          },
        },
      },
    },
    {
      // Patient avec un nom similaire ou contenant "pat"
      firstName: 'Patrick',
      lastName: 'Paterson',
      email: 'patrick.paterson@test.com',
      phone: '+33677777777',
      password: hashedPassword,
      role: Role.PATIENT,
      userStatus: UserStatus.ACTIVE,
      patient: {
        create: {
          age: 45,
          gender: 'M',
          birthDate: new Date('1981-08-30'),
          address: '50 Boulevard Victor Hugo, Marseille',
          intern: false,
          medicalRecord: {
            create: {
              poids: 95.0,
              taille: 1.78,
              bloodType: BloodType.AB,
              imc: Imc.OBESITY, // Utilise la valeur enum exacte de ton schéma Prisma
              medical_history: 'Hypercholestérolémie.',
              family_history: 'Cardiopathie ischémique côté paternel.',
              allergies: 'Iode',
            },
          },
        },
      },
    },
    {
      // Patiente senior pour tester la gériatrie ou le tri alphabétique
      firstName: 'Marie',
      lastName: 'Durand',
      email: 'marie.durand@test.com',
      phone: '+33688888888',
      password: hashedPassword,
      role: Role.PATIENT,
      userStatus: UserStatus.ACTIVE,
      patient: {
        create: {
          age: 82,
          gender: 'F',
          birthDate: new Date('1944-01-05'),
          address: '14 Rue des Lilas, Lille',
          intern: true,
          medicalRecord: {
            create: {
              poids: 54.2,
              taille: 1.55,
              bloodType: BloodType.A,
              imc: Imc.NORMAL_WEIGHT,
              medical_history: 'Ostéoporose, Arthroplastie de la hanche gauche.',
              family_history: 'Inconnu.',
              allergies: 'Lactose',
            },
          },
        },
      },
    },
    {
      // Test de casse et espaces : nom à particule "Le Pennec"
      firstName: 'Arthur',
      lastName: 'Le Pennec',
      email: 'arthur.lp@test.com',
      phone: '+33712345678',
      password: hashedPassword,
      role: Role.PATIENT,
      userStatus: UserStatus.ACTIVE,
      patient: {
        create: {
          age: 19,
          gender: 'M',
          birthDate: new Date('2007-07-19'),
          address: '3 Boulevard de Cimiez, Nice',
          intern: false,
          medicalRecord: {
            create: {
              poids: 51.0,
              taille: 1.75,
              bloodType: BloodType.AB,
              imc: Imc.UNDERWEIGHT,
              medical_history: 'Scoliose juvénile.',
              family_history: 'Diabète de type 1 chez le frère.',
              allergies: 'Arachides',
            },
          },
        },
      },
    },
    {
      // Cas critique d'obésité sévère pour tester les valeurs d'IMC complexes du schéma
      firstName: 'Chantal',
      lastName: 'Gomez',
      email: 'chantal.gomez@test.com',
      phone: '+33655544433',
      password: hashedPassword,
      role: Role.PATIENT,
      userStatus: UserStatus.ACTIVE,
      patient: {
        create: {
          age: 54,
          gender: 'F',
          birthDate: new Date('1972-10-02'),
          address: '88 Avenue Jean Médecin, Nice',
          intern: true,
          medicalRecord: {
            create: {
              poids: 112.5,
              taille: 1.60,
              bloodType: BloodType.B,
              imc: Imc.CLASS_2_OBESITY, // Utilise la valeur enum exacte de ton schéma Prisma
              medical_history: 'Apnée du sommeil, Arthrose bilatérale des genoux.',
              family_history: 'Obésité morbide généralisée côté maternel.',
              allergies: 'Aucune',
            },
          },
        },
      },
    },
    {
      // Homonyme partiel : prénom "Jean" mais nom de famille court
      firstName: 'Jean',
      lastName: 'Rey',
      email: 'jean.rey@test.com',
      phone: '+33601020304',
      password: hashedPassword,
      role: Role.PATIENT,
      userStatus: UserStatus.ACTIVE,
      patient: {
        create: {
          age: 41,
          gender: 'M',
          birthDate: new Date('1985-02-28'),
          address: '2 Pl. Masséna, Nice',
          intern: false,
          medicalRecord: {
            create: {
              poids: 80.0,
              taille: 1.82,
              bloodType: BloodType.O,
              imc: Imc.NORMAL_WEIGHT,
              medical_history: 'Appendicectomie en 2012.',
              family_history: 'Inconnu.',
              allergies: 'Fruits de mer',
            },
          },
        },
      },
    },
    {
      // Profil PENDING : pour tester la filtration des comptes non-activés
      firstName: 'Lucas',
      lastName: 'Dubois',
      email: 'lucas.pending@test.com',
      phone: '+33698765432',
      password: hashedPassword,
      role: Role.PATIENT,
      userStatus: UserStatus.PENDING,
      patient: {
        create: {
          age: 24,
          gender: 'M',
          birthDate: new Date('2002-12-05'),
          address: '56 Rue d’Antibes, Cannes',
          intern: false,
          medicalRecord: {
            create: {
              poids: 70.0,
              taille: 1.77,
              bloodType: BloodType.A,
              imc: Imc.NORMAL_WEIGHT,
              medical_history: 'Fracture du scaphoïde droit (2025).',
              family_history: 'Aucun.',
              allergies: 'Aucune',
            },
          },
        },
      },
    }
  ];

  for (const patient of patientsData) {
    await prisma.user.create({ data: patient });
  }

  // ==========================================
  // 4. CRÉATION DES MÉDECINS (DOCTOR)
  // ==========================================
  console.log('🩺 Création des médecins...');
  
  // Médecin 1 : Sarah Connor
  await prisma.user.create({
    data: {
      firstName: 'Sarah',
      lastName: 'Connor',
      email: 'doctor@test.com',
      phone: '+33612345678',
      password: hashedPassword,
      role: Role.DOCTOR,
      userStatus: UserStatus.ACTIVE,
      medicalStaff: {
        create: {
          staffNumber: 8877,
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
      userStatus: UserStatus.ACTIVE,
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
  console.log('🧑‍⚕️ Création des aides-soignants...');
  
  // Aide-soignant 1
  await prisma.user.create({
    data: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'nurse1@test.com',
      phone: '+33633345678',
      password: hashedPassword,
      role: Role.NURSE_ASSISTANT,
      userStatus: UserStatus.ACTIVE,
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
      userStatus: UserStatus.ACTIVE,
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
  console.log('💼 Création de l’administrateur...');
  await prisma.user.create({
    data: {
      firstName: 'Boss',
      lastName: 'Admin',
      email: 'admin@test.com',
      phone: '+33600000000',
      password: hashedPassword,
      role: Role.ADMINISTRATOR,
      userStatus: UserStatus.ACTIVE,
      activationToken: "test",
      administrator: {
        create: {
          position: 'Directeur des Ressources Humaines',
        },
      },
    },
  });

  console.log('✅ Seeding terminé avec succès ! Base de données prête pour les tests.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });