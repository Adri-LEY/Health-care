import { PrismaClient, Role, BloodType, Imc, UserStatus, RiskClass, MeasurementType, AppointmentStatus } from '@prisma/client';
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

  // Nettoyage des rendez-vous et des créneaux
  await prisma.appointment.deleteMany({});
  await prisma.timeSlot.deleteMany({});

  // Tables dépendantes des consultations et dossiers
  await prisma.prescriptionItem.deleteMany({});
  await prisma.prescription.deleteMany({});
  await prisma.consultation.deleteMany({});
  await prisma.cardiologyAiAnalysis.deleteMany({});
  await prisma.biometricMeasure.deleteMany({});

  // Tables de référence médicale
  await prisma.medication.deleteMany({});
  await prisma.medicalEquipment.deleteMany({});
  await prisma.paramedicalCare.deleteMany({});

  // Tables utilisateurs et structures
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

  const tablesWithSeq = [
    'User', 'Patient', 'MedicalStaff', 'Doctor', 'NurseAssistant',
    'Administrator', 'Specialty', 'Service', 'MedicalRecord',
    'Consultation', 'CardiologyAiAnalysis', 'Prescription',
    'PrescriptionItem', 'Medication', 'MedicalEquipment', 'ParamedicalCare',
    'TimeSlot', 'Appointment'
  ];

  for (const table of tablesWithSeq) {
    // Sous PostgreSQL, réinitialisation des incréments d'ID (séquences)
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE "${table}_id_seq" RESTART WITH 1;`);
  }

  // ==========================================
  // 2. CRÉATION DES TABLES DE RÉFÉRENCE MÉDICALE
  // ==========================================
  console.log('💊 Création des médicaments, matériels et soins paramédicaux...');

  const doliprane = await prisma.medication.create({
    data: { name: 'Doliprane', dosage: '1000mg' }
  });
  const metformine = await prisma.medication.create({
    data: { name: 'Metformine', dosage: '500mg' }
  });
  const ventoline = await prisma.medication.create({
    data: { name: 'Ventoline Spray', dosage: '100mcg' }
  });
  const atorvastatine = await prisma.medication.create({
    data: { name: 'Atorvastatine', dosage: '20mg' }
  });
  const kardegic = await prisma.medication.create({
    data: { name: 'Kardegic', dosage: '75mg' }
  });

  const bloodPressureMonitor = await prisma.medicalEquipment.create({
    data: { name: 'Tensiomètre connecté' }
  });
  const nebulizer = await prisma.medicalEquipment.create({
    data: { name: 'Nébuliseur portable' }
  });

  const physiotherapy = await prisma.paramedicalCare.create({
    data: { description: 'Séances de rééducation et de kinésithérapie active' }
  });
  const nursingCare = await prisma.paramedicalCare.create({
    data: { description: 'Surveillance glycémique à domicile par IDE' }
  });

  // ==========================================
  // 3. CRÉATION DES DONNÉES ANNEXES (Spécialités & Services)
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
  // 4. CRÉATION DES PATIENTS & LEURS DOSSIERS
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
              imc: Imc.CLASS_1_OBESITY,
              medical_history: 'Hypercholestérolémie.',
              family_history: 'Cardiopathie ischémique côté paternel.',
              allergies: 'Iode',
            },
          },
        },
      },
    },
    {
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
              imc: Imc.CLASS_2_OBESITY,
              medical_history: 'Apnée du sommeil, Arthrose bilatérale des genoux.',
              family_history: 'Obésité morbide généralisée côté maternel.',
              allergies: 'Aucune',
            },
          },
        },
      },
    },
    {
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
  // 5. CRÉATION DES MÉDECINS (DOCTOR) & STAFF
  // ==========================================
  console.log('🩺 Création des médecins...');

  const doctor1User = await prisma.user.create({
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
    include: { medicalStaff: { include: { doctor: true } } }
  });

  const doctor2User = await prisma.user.create({
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
    include: { medicalStaff: { include: { doctor: true } } }
  });

  const doctor1Id = doctor1User.medicalStaff?.doctor?.id;
  const doctor2Id = doctor2User.medicalStaff?.doctor?.id;

  // ==========================================
  // 6. CRÉATION DES AIDES-SOIGNANTS (NURSE_ASSISTANT)
  // ==========================================
  console.log('🧑‍⚕️ Création des aides-soignants...');

  const nurse1User = await prisma.user.create({
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
    include: { medicalStaff: { include: { nurseAssistant: true } } }
  });

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

  const nurse1Id = nurse1User.medicalStaff?.nurseAssistant?.id;

  // ==========================================
  // 7. CRÉATION DE L'ADMINISTRATEUR
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

  // ==========================================
  // 8. CRÉATION DES CONSULTATIONS ET MESURES BIOMÉTRIQUES
  // ==========================================
  console.log('📅 Génération des consultations, mesures biométriques et ordonnances...');

  const records = await prisma.medicalRecord.findMany({
    include: {
      patient: {
        include: {
          user: true
        }
      }
    }
  });

  for (const record of records) {
    const patientName = `${record.patient?.user.firstName} ${record.patient?.user.lastName}`;

    if (record.patient?.user.email === 'patient@test.com') {
      const c1 = await prisma.consultation.create({
        data: {
          medicalRecordId: record.id,
          date: new Date('2025-07-16T10:00:00.000Z'),
          visitReason: 'Check-up initial d’entrée',
          observations: 'Première visite. Patient globalement en bonne santé. Prise de contact.',
          biometricMeasures: JSON.stringify({
            temperature: 36.6,
            heartRate: 72,
            bloodPressure: '122/80',
            weight: 75.5,
            height: 1.80,
            oxygenSaturation: 99,
            bloodGlucose: 95
          }),
        }
      });

      const c2 = await prisma.consultation.create({
        data: {
          medicalRecordId: record.id,
          date: new Date('2026-01-15T09:15:00.000Z'),
          visitReason: 'Syndrome grippal',
          observations: 'Fièvre modérée, courbatures et fatigue intense depuis 48h. Repos prescrit.',
          biometricMeasures: JSON.stringify({
            temperature: 38.2,
            heartRate: 80,
            bloodPressure: '118/75',
            weight: 75.0,
            height: 1.80,
            oxygenSaturation: 97,
            bloodGlucose: 100
          }),
          prescription: {
            create: {
              prescriptionItems: {
                create: [
                  {
                    name: 'Doliprane 1000mg',
                    description: 'Traitement symptomatique de la fièvre et des courbatures',
                    dosage: '1 comprimé toutes les 6 heures si besoin (max 4g/jour)',
                    duration: '5 jours',
                    medicationId: doliprane.id
                  }
                ]
              }
            }
          }
        }
      });

      const c3 = await prisma.consultation.create({
        data: {
          medicalRecordId: record.id,
          date: new Date('2026-07-16T14:00:00.000Z'),
          visitReason: 'Contrôle annuel de routine',
          observations: 'Patient en excellente forme physique. Récupération post-grippale parfaite. Pratique une activité sportive régulière.',
          biometricMeasures: JSON.stringify({
            temperature: 36.7,
            heartRate: 68,
            bloodPressure: '120/80',
            weight: 75.5,
            height: 1.80,
            oxygenSaturation: 98,
            bloodGlucose: 92
          }),
        }
      });

      await prisma.biometricMeasure.createMany({
        data: [
          { type: MeasurementType.WEIGHT, value: 75.5, unit: 'kg', medicalRecordId: record.id, consultationId: c1.id, takenById: nurse1Id, takenAt: new Date('2025-07-16T10:00:00.000Z') },
          { type: MeasurementType.HEIGHT, value: 1.80, unit: 'm', medicalRecordId: record.id, consultationId: c1.id, takenById: nurse1Id, takenAt: new Date('2025-07-16T10:00:00.000Z') },
          { type: MeasurementType.TEMPERATURE, value: 36.6, unit: '°C', medicalRecordId: record.id, consultationId: c1.id, takenById: nurse1Id, takenAt: new Date('2025-07-16T10:00:00.000Z') },
          { type: MeasurementType.HEART_RATE, value: 72, unit: 'bpm', medicalRecordId: record.id, consultationId: c1.id, takenById: nurse1Id, takenAt: new Date('2025-07-16T10:00:00.000Z') },
          { type: MeasurementType.BLOOD_PRESSURE, value: 122, unit: 'mmHg', medicalRecordId: record.id, consultationId: c1.id, takenById: nurse1Id, takenAt: new Date('2025-07-16T10:00:00.000Z') },
          { type: MeasurementType.OXYGEN_SATURATION, value: 99, unit: '%', medicalRecordId: record.id, consultationId: c1.id, takenById: nurse1Id, takenAt: new Date('2025-07-16T10:00:00.000Z') },
          { type: MeasurementType.BLOOD_GLUCOSE, value: 95, unit: 'mg/dL', medicalRecordId: record.id, consultationId: c1.id, takenById: nurse1Id, takenAt: new Date('2025-07-16T10:00:00.000Z') },

          { type: MeasurementType.WEIGHT, value: 75.0, unit: 'kg', medicalRecordId: record.id, consultationId: c2.id, takenById: nurse1Id, takenAt: new Date('2026-01-15T09:15:00.000Z') },
          { type: MeasurementType.TEMPERATURE, value: 38.2, unit: '°C', medicalRecordId: record.id, consultationId: c2.id, takenById: nurse1Id, takenAt: new Date('2026-01-15T09:15:00.000Z') },
          { type: MeasurementType.HEART_RATE, value: 80, unit: 'bpm', medicalRecordId: record.id, consultationId: c2.id, takenById: nurse1Id, takenAt: new Date('2026-01-15T09:15:00.000Z') },
          { type: MeasurementType.OXYGEN_SATURATION, value: 97, unit: '%', medicalRecordId: record.id, consultationId: c2.id, takenById: nurse1Id, takenAt: new Date('2026-01-15T09:15:00.000Z') },

          { type: MeasurementType.WEIGHT, value: 75.5, unit: 'kg', medicalRecordId: record.id, consultationId: c3.id, takenById: nurse1Id, takenAt: new Date('2026-07-16T14:00:00.000Z') },
          { type: MeasurementType.HEART_RATE, value: 68, unit: 'bpm', medicalRecordId: record.id, consultationId: c3.id, takenById: nurse1Id, takenAt: new Date('2026-07-16T14:00:00.000Z') },
          { type: MeasurementType.OXYGEN_SATURATION, value: 98, unit: '%', medicalRecordId: record.id, consultationId: c3.id, takenById: nurse1Id, takenAt: new Date('2026-07-16T14:00:00.000Z') }
        ]
      });
    } else if (record.patient?.user.email === 'jean.dupont.bis@test.com') {
      const c1 = await prisma.consultation.create({
        data: {
          medicalRecord: { connect: { id: record.id } },
          date: new Date('2026-01-10T11:00:00.000Z'),
          visitReason: 'Bilan de découverte - Diabète de type 2',
          observations: 'Découverte fortuite de glycémies à jeun élevées. Mise en place d’un protocole diététique et thérapeutique initial.',
          biometricMeasures: JSON.stringify({
            temperature: 36.4,
            heartRate: 75,
            bloodPressure: '140/88',
            weight: 88.0,
            height: 1.72,
            oxygenSaturation: 96,
            bloodGlucose: 145
          }),
          aiAnalysis: {
            create: {
              riskScore: 55.0,
              riskClass: RiskClass.Moderate,
              message: 'Risque cardiovasculaire modéré d’entrée de jeu en raison de l’âge (68 ans) et du profil glycémique.'
            }
          }
        }
      });

      const c2 = await prisma.consultation.create({
        data: {
          medicalRecord: { connect: { id: record.id } },
          date: new Date('2026-07-16T10:30:00.000Z'),
          visitReason: 'Suivi trimestriel diabète et cardiologie',
          observations: 'Légers picotements signalés aux extrémités. Tension légèrement élevée mais stable par rapport au dernier contrôle.',
          biometricMeasures: JSON.stringify({
            temperature: 36.5,
            heartRate: 78,
            bloodPressure: '138/85',
            weight: 87.2,
            height: 1.72,
            oxygenSaturation: 97,
            bloodGlucose: 130
          }),
          aiAnalysis: {
            create: {
              riskScore: 62.5,
              riskClass: RiskClass.Moderate,
              message: 'Risque cardiovasculaire modéré. Surveillance requise en raison de l’âge et des premiers signes neuropathiques.'
            }
          },
          prescription: {
            create: {
              prescriptionItems: {
                create: [
                  {
                    name: 'Metformine 500mg',
                    description: 'Antidiabétique oral',
                    dosage: '1 comprimé matin et soir au milieu des repas',
                    duration: '3 mois',
                    medicationId: metformine.id,
                    careId: nursingCare.id
                  }
                ]
              }
            }
          }
        }
      });

      await prisma.biometricMeasure.createMany({
        data: [
          { type: MeasurementType.WEIGHT, value: 88.0, unit: 'kg', medicalRecordId: record.id, consultationId: c1.id, takenById: nurse1Id, takenAt: new Date('2026-01-10T11:00:00.000Z') },
          { type: MeasurementType.HEIGHT, value: 1.72, unit: 'm', medicalRecordId: record.id, consultationId: c1.id, takenById: nurse1Id, takenAt: new Date('2026-01-10T11:00:00.000Z') },
          { type: MeasurementType.BLOOD_PRESSURE, value: 140, unit: 'mmHg', medicalRecordId: record.id, consultationId: c1.id, takenById: nurse1Id, takenAt: new Date('2026-01-10T11:00:00.000Z') },
          { type: MeasurementType.BLOOD_GLUCOSE, value: 145, unit: 'mg/dL', medicalRecordId: record.id, consultationId: c1.id, takenById: nurse1Id, takenAt: new Date('2026-01-10T11:00:00.000Z') },
          { type: MeasurementType.OXYGEN_SATURATION, value: 96, unit: '%', medicalRecordId: record.id, consultationId: c1.id, takenById: nurse1Id, takenAt: new Date('2026-01-10T11:00:00.000Z') },

          { type: MeasurementType.WEIGHT, value: 87.2, unit: 'kg', medicalRecordId: record.id, consultationId: c2.id, takenById: nurse1Id, takenAt: new Date('2026-07-16T14:00:00.000Z') },
          { type: MeasurementType.BLOOD_GLUCOSE, value: 130, unit: 'mg/dL', medicalRecordId: record.id, consultationId: c2.id, takenById: nurse1Id, takenAt: new Date('2026-07-16T14:00:00.000Z') },
          { type: MeasurementType.BLOOD_PRESSURE, value: 138, unit: 'mmHg', medicalRecordId: record.id, consultationId: c2.id, takenById: nurse1Id, takenAt: new Date('2026-07-16T14:00:00.000Z') }
        ]
      });
    } else if (record.patient?.user.email === 'pat.martinez@test.com') {
      const c1 = await prisma.consultation.create({
        data: {
          medicalRecordId: record.id,
          visitReason: 'Suivi de crise d’asthme saisonnière',
          observations: 'Sifflements bronchiques légers entendus à l’auscultation.',
          biometricMeasures: JSON.stringify({
            temperature: 36.8,
            heartRate: 72,
            bloodPressure: '115/75',
            weight: 62.1,
            height: 1.68,
            oxygenSaturation: 94,
            bloodGlucose: 88
          }),
          prescription: {
            create: {
              prescriptionItems: {
                create: [
                  {
                    name: 'Ventoline Spray',
                    description: 'Bronchodilatateur d’action rapide',
                    dosage: '2 bouffées en cas de crise ou de gêne respiratoire',
                    duration: '1 mois',
                    medicationId: ventoline.id,
                    equipmentId: nebulizer.id
                  }
                ]
              }
            }
          }
        }
      });

      await prisma.biometricMeasure.createMany({
        data: [
          { type: MeasurementType.WEIGHT, value: 62.1, unit: 'kg', medicalRecordId: record.id, consultationId: c1.id, takenById: nurse1Id, takenAt: new Date('2026-01-10T11:00:00.000Z') },
          { type: MeasurementType.HEIGHT, value: 1.68, unit: 'm', medicalRecordId: record.id, consultationId: c1.id, takenById: nurse1Id, takenAt: new Date('2026-01-10T11:00:00.000Z') },
          { type: MeasurementType.OXYGEN_SATURATION, value: 94, unit: '%', medicalRecordId: record.id, consultationId: c1.id, takenById: nurse1Id, takenAt: new Date('2026-01-10T11:00:00.000Z') },
          { type: MeasurementType.HEART_RATE, value: 72, unit: 'bpm', medicalRecordId: record.id, consultationId: c1.id, takenById: nurse1Id, takenAt: new Date('2026-01-10T11:00:00.000Z') }
        ]
      });
    } else if (record.patient?.user.email === 'patrick.paterson@test.com') {
      const c1 = await prisma.consultation.create({
        data: {
          medicalRecord: { connect: { id: record.id } },
          visitReason: 'Bilan lipidique et douleurs thoraciques d’effort',
          observations: 'Patient se plaint d’oppressions thoraciques lors d’efforts modérés. Perte de poids fortement recommandée.',
          biometricMeasures: JSON.stringify({
            temperature: 36.6,
            heartRate: 85,
            bloodPressure: '145/92',
            weight: 95.0,
            height: 1.78,
            oxygenSaturation: 97,
            bloodGlucose: 110
          }),
          aiAnalysis: {
            create: {
              riskScore: 88.4,
              riskClass: RiskClass.High,
              message: 'RISQUE ÉLEVÉ. Angiographie et consultation spécialisée en urgence recommandées.'
            }
          },
          prescription: {
            create: {
              prescriptionItems: {
                create: [
                  {
                    name: 'Atorvastatine 20mg',
                    description: 'Traitement contre le cholestérol',
                    dosage: '1 comprimé le soir au coucher',
                    duration: '6 mois',
                    medicationId: atorvastatine.id
                  },
                  {
                    name: 'Kardegic 75mg',
                    description: 'Antiagrégant plaquettaire',
                    dosage: '1 sachet par jour au milieu du déjeuner',
                    duration: '6 mois',
                    medicationId: kardegic.id,
                    equipmentId: bloodPressureMonitor.id
                  }
                ]
              }
            }
          }
        }
      });

      await prisma.biometricMeasure.createMany({
        data: [
          { type: MeasurementType.WEIGHT, value: 95.0, unit: 'kg', medicalRecordId: record.id, consultationId: c1.id, takenById: nurse1Id, takenAt: new Date('2026-01-10T11:00:00.000Z') },
          { type: MeasurementType.HEIGHT, value: 1.78, unit: 'm', medicalRecordId: record.id, consultationId: c1.id, takenById: nurse1Id, takenAt: new Date('2026-01-10T11:00:00.000Z') },
          { type: MeasurementType.BLOOD_PRESSURE, value: 145, unit: 'mmHg', medicalRecordId: record.id, consultationId: c1.id, takenById: nurse1Id, takenAt: new Date('2026-01-10T11:00:00.000Z') },
          { type: MeasurementType.HEART_RATE, value: 85, unit: 'bpm', medicalRecordId: record.id, consultationId: c1.id, takenById: nurse1Id, takenAt: new Date('2026-01-10T11:00:00.000Z') },
          { type: MeasurementType.BLOOD_GLUCOSE, value: 110, unit: 'mg/dL', medicalRecordId: record.id, consultationId: c1.id, takenById: nurse1Id, takenAt: new Date('2026-01-10T11:00:00.000Z') }
        ]
      });
    } else if (record.patient?.user.email === 'marie.durand@test.com') {
      const c1 = await prisma.consultation.create({
        data: {
          medicalRecordId: record.id,
          visitReason: 'Douleurs articulaires diffuses',
          observations: 'Mobilité difficile. Douleur d’arthrose accrue due au froid.',
          biometricMeasures: JSON.stringify({
            temperature: 36.2,
            heartRate: 70,
            bloodPressure: '130/80',
            weight: 54.2,
            height: 1.55,
            oxygenSaturation: 98,
            bloodGlucose: 90
          }),
          prescription: {
            create: {
              prescriptionItems: {
                create: [
                  {
                    name: 'Doliprane 1000mg',
                    description: 'Antalgique',
                    dosage: '1 comprimé toutes les 8 heures',
                    duration: '15 jours',
                    medicationId: doliprane.id,
                    careId: physiotherapy.id
                  }
                ]
              }
            }
          }
        }
      });

      await prisma.biometricMeasure.createMany({
        data: [
          { type: MeasurementType.WEIGHT, value: 54.2, unit: 'kg', medicalRecordId: record.id, consultationId: c1.id, takenById: nurse1Id, takenAt: new Date('2026-01-10T11:00:00.000Z') },
          { type: MeasurementType.HEIGHT, value: 1.55, unit: 'm', medicalRecordId: record.id, consultationId: c1.id, takenById: nurse1Id, takenAt: new Date('2026-01-10T11:00:00.000Z') },
          { type: MeasurementType.TEMPERATURE, value: 36.2, unit: '°C', medicalRecordId: record.id, consultationId: c1.id, takenById: nurse1Id, takenAt: new Date('2026-01-10T11:00:00.000Z') },
          { type: MeasurementType.BLOOD_PRESSURE, value: 130, unit: 'mmHg', medicalRecordId: record.id, consultationId: c1.id, takenById: nurse1Id, takenAt: new Date('2026-01-10T11:00:00.000Z') }
        ]
      });
    } else if (record.patient?.user.email === 'arthur.lp@test.com') {
      const c1 = await prisma.consultation.create({
        data: {
          medicalRecordId: record.id,
          visitReason: 'Suivi de posture (scoliose)',
          observations: 'Pas d’aggravation de la courbure. Continuer les exercices physiques.',
          biometricMeasures: JSON.stringify({
            temperature: 36.6,
            heartRate: 62,
            bloodPressure: '110/70',
            weight: 51.0,
            height: 1.75,
            oxygenSaturation: 99,
            bloodGlucose: 85
          })
        }
      });

      await prisma.biometricMeasure.createMany({
        data: [
          { type: MeasurementType.WEIGHT, value: 51.0, unit: 'kg', medicalRecordId: record.id, consultationId: c1.id, takenById: nurse1Id, takenAt: new Date('2026-01-10T11:00:00.000Z') },
          { type: MeasurementType.HEIGHT, value: 1.75, unit: 'm', medicalRecordId: record.id, consultationId: c1.id, takenById: nurse1Id, takenAt: new Date('2026-01-10T11:00:00.000Z') },
          { type: MeasurementType.HEART_RATE, value: 62, unit: 'bpm', medicalRecordId: record.id, consultationId: c1.id, takenById: nurse1Id, takenAt: new Date('2026-01-10T11:00:00.000Z') },
          { type: MeasurementType.OXYGEN_SATURATION, value: 99, unit: '%', medicalRecordId: record.id, consultationId: c1.id, takenById: nurse1Id, takenAt: new Date('2026-01-10T11:00:00.000Z') }
        ]
      });
    } else if (record.patient?.user.email === 'chantal.gomez@test.com') {
      const c1 = await prisma.consultation.create({
        data: {
          medicalRecord: { connect: { id: record.id } },
          visitReason: 'Fatigue diurne et suivi sommeil',
          observations: 'Somnolence résiduelle persistante. L’appareil PPC est bien supporté.',
          biometricMeasures: JSON.stringify({
            temperature: 36.4,
            heartRate: 74,
            bloodPressure: '135/88',
            weight: 112.5,
            height: 1.60,
            oxygenSaturation: 93,
            bloodGlucose: 105
          }),
          aiAnalysis: {
            create: {
              riskScore: 45.0,
              riskClass: RiskClass.Moderate,
              message: 'Risque modéré lié à l’apnée obstructive du sommeil.'
            }
          }
        }
      });

      await prisma.biometricMeasure.createMany({
        data: [
          { type: MeasurementType.WEIGHT, value: 112.5, unit: 'kg', medicalRecordId: record.id, consultationId: c1.id, takenById: nurse1Id, takenAt: new Date('2026-01-10T11:00:00.000Z') },
          { type: MeasurementType.HEIGHT, value: 1.60, unit: 'm', medicalRecordId: record.id, consultationId: c1.id, takenById: nurse1Id, takenAt: new Date('2026-01-10T11:00:00.000Z') },
          { type: MeasurementType.OXYGEN_SATURATION, value: 93, unit: '%', medicalRecordId: record.id, consultationId: c1.id, takenById: nurse1Id, takenAt: new Date('2026-01-10T11:00:00.000Z') },
          { type: MeasurementType.BLOOD_PRESSURE, value: 135, unit: 'mmHg', medicalRecordId: record.id, consultationId: c1.id, takenById: nurse1Id, takenAt: new Date('2026-01-10T11:00:00.000Z') }
        ]
      });
    } else if (record.patient?.user.email === 'jean.rey@test.com') {
      const c1 = await prisma.consultation.create({
        data: {
          medicalRecordId: record.id,
          visitReason: 'Contrôle post-appendicectomie',
          observations: 'Cicatrice saine, propre et solide. Reprise totale des activités physiques autorisée.',
          biometricMeasures: JSON.stringify({
            temperature: 36.7,
            heartRate: 66,
            bloodPressure: '120/75',
            weight: 80.0,
            height: 1.82,
            oxygenSaturation: 98,
            bloodGlucose: 91
          })
        }
      });

      await prisma.biometricMeasure.createMany({
        data: [
          { type: MeasurementType.WEIGHT, value: 80.0, unit: 'kg', medicalRecordId: record.id, consultationId: c1.id, takenById: nurse1Id, takenAt: new Date('2026-01-10T11:00:00.000Z') },
          { type: MeasurementType.HEIGHT, value: 1.82, unit: 'm', medicalRecordId: record.id, consultationId: c1.id, takenById: nurse1Id, takenAt: new Date('2026-01-10T11:00:00.000Z') },
          { type: MeasurementType.TEMPERATURE, value: 36.7, unit: '°C', medicalRecordId: record.id, consultationId: c1.id, takenById: nurse1Id, takenAt: new Date('2026-01-10T11:00:00.000Z') },
          { type: MeasurementType.HEART_RATE, value: 66, unit: 'bpm', medicalRecordId: record.id, consultationId: c1.id, takenById: nurse1Id, takenAt: new Date('2026-01-10T11:00:00.000Z') }
        ]
      });
    } else if (record.patient?.user.email === 'lucas.pending@test.com') {
      const c1 = await prisma.consultation.create({
        data: {
          medicalRecordId: record.id,
          visitReason: 'Suivi de fracture du scaphoïde',
          observations: 'Plâtre en bon état. Pas de douleur signalée.',
          biometricMeasures: JSON.stringify({
            temperature: 36.8,
            heartRate: 64,
            bloodPressure: '118/78',
            weight: 70.0,
            height: 1.77,
            oxygenSaturation: 99,
            bloodGlucose: 89
          })
        }
      });

      await prisma.biometricMeasure.createMany({
        data: [
          { type: MeasurementType.WEIGHT, value: 70.0, unit: 'kg', medicalRecordId: record.id, consultationId: c1.id, takenById: nurse1Id, takenAt: new Date('2026-01-10T11:00:00.000Z') },
          { type: MeasurementType.HEIGHT, value: 1.77, unit: 'm', medicalRecordId: record.id, consultationId: c1.id, takenById: nurse1Id, takenAt: new Date('2026-01-10T11:00:00.000Z') },
          { type: MeasurementType.BLOOD_PRESSURE, value: 118, unit: 'mmHg', medicalRecordId: record.id, consultationId: c1.id, takenById: nurse1Id, takenAt: new Date('2026-01-10T11:00:00.000Z') }
        ]
      });
    }

    console.log(` ✅ Consultation(s) générée(s) pour le dossier de : ${patientName}`);
  }

  // ==========================================
  // 9. PLANIFICATION DES CRÉNEAUX ET RENDEZ-VOUS
  // ==========================================
  console.log('🗓️ Génération automatique d’une grille complète de créneaux sur 4 semaines...');

  const patient1 = await prisma.patient.findFirst({ where: { user: { email: 'patient@test.com' } } });
  const patient2 = await prisma.patient.findFirst({ where: { user: { email: 'pat.martinez@test.com' } } });
  const patient3 = await prisma.patient.findFirst({ where: { user: { email: 'patrick.paterson@test.com' } } });
  const patient4 = await prisma.patient.findFirst({ where: { user: { email: 'marie.durand@test.com' } } });

  const startDate = new Date();
  startDate.setUTCHours(0, 0, 0, 0);

  // Générer des créneaux pour les 28 prochains jours (4 semaines)
  for (let dayOffset = 0; dayOffset < 28; dayOffset++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + dayOffset);

    const dayOfWeek = currentDate.getDay();

    // Exclure le week-end (0 = Dimanche, 6 = Samedi)
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    // Horaires de travail : 08h00 à 12h00 puis 14h00 à 17h00 (créneaux de 30 min)
    const hours = [8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 14, 14.5, 15, 15.5, 16, 16.5];

    for (const hour of hours) {
      const slotStart = new Date(currentDate);
      const slotEnd = new Date(currentDate);

      const h = Math.floor(hour);
      const m = (hour % 1) * 60;

      slotStart.setUTCHours(h, m, 0, 0);
      slotEnd.setUTCHours(h, m + 30, 0, 0);

      // Création du TimeSlot partagé
      const slot = await prisma.timeSlot.create({
        data: {
          date: currentDate,
          startTime: slotStart,
          endTime: slotEnd,
          isLocked: false,
        },
      });

      // -------------------------------------------------------------
      // RENDEZ-VOUS POUR DOCTEUR 1 (Dr. Sarah Connor)
      // -------------------------------------------------------------
      if (dayOffset === 1 && hour === 10 && doctor1Id && patient1) {
        // Demain à 10h00 : RDV confirmé pour Doctor 1
        await prisma.appointment.create({
          data: {
            dateTime: slot.startTime,
            status: AppointmentStatus.CONFIRMED,
            patientId: patient1.id,
            doctorId: doctor1Id,
            timeSlotId: slot.id,
          },
        });
      } else if (dayOffset === 2 && hour === 14 && doctor1Id && patient2) {
        // Dans 2 jours à 14h00 : RDV programmé pour Doctor 1
        await prisma.appointment.create({
          data: {
            dateTime: slot.startTime,
            status: AppointmentStatus.SCHEDULED,
            patientId: patient2.id,
            doctorId: doctor1Id,
            timeSlotId: slot.id,
          },
        });
      }

      // -------------------------------------------------------------
      // RENDEZ-VOUS POUR DOCTEUR 2 (Dr. Gregory House)
      // -------------------------------------------------------------
      if (dayOffset === 1 && hour === 11 && doctor2Id && patient3) {
        // Demain à 11h00 : RDV confirmé pour Doctor 2
        await prisma.appointment.create({
          data: {
            dateTime: slot.startTime,
            status: AppointmentStatus.CONFIRMED,
            patientId: patient3.id,
            doctorId: doctor2Id,
            timeSlotId: slot.id,
          },
        });
      } else if (dayOffset === 3 && hour === 15.5 && doctor2Id && patient4) {
        // Dans 3 jours à 15h30 : RDV programmé pour Doctor 2
        await prisma.appointment.create({
          data: {
            dateTime: slot.startTime,
            status: AppointmentStatus.SCHEDULED,
            patientId: patient4.id,
            doctorId: doctor2Id,
            timeSlotId: slot.id,
          },
        });
      }
    }
  }

  console.log('✅ Seeding terminé avec succès ! Les médecins ont des rendez-vous distincts.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });