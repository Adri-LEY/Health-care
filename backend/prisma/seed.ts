import { PrismaClient, Role, BloodType, Imc, UserStatus, RiskClass } from '@prisma/client';
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

  // Tables dépendantes des consultations
  await prisma.prescriptionItem.deleteMany({});
  await prisma.prescription.deleteMany({});
  await prisma.consultation.deleteMany({});
  await prisma.cardiologyAiAnalysis.deleteMany({});

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

  const tables = [
    'User', 'Patient', 'MedicalStaff', 'Doctor', 'NurseAssistant',
    'Administrator', 'Specialty', 'Service', 'MedicalRecord',
    'Consultation', 'CardiologyAiAnalysis', 'Prescription',
    'PrescriptionItem', 'Medication', 'MedicalEquipment', 'ParamedicalCare'
  ];

  for (const table of tables) {
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
              imc: Imc.OBESITY,
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
  // 6. CRÉATION DES AIDES-SOIGNANTS (NURSE_ASSISTANT)
  // ==========================================
  console.log('🧑‍⚕️ Création des aides-soignants...');

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
  // 8. CRÉATION DES CONSULTATIONS (Adapté au Schéma)
  // ==========================================
  console.log('📅 Génération des consultations et des ordonnances...');

  // Récupérer tous les dossiers médicaux créés pour pouvoir y associer les consultations
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

    // -----------------------------------------------------------------------------------------------------------------
    // Cas 1 : Patient Jean Dupont (3 consultations pour tester un historique complet)
    // -----------------------------------------------------------------------------------------------------------------
    if (record.patient?.user.email === 'patient@test.com') {
      
      // Consultation 1 : La plus ancienne (Il y a 1 an)
      await prisma.consultation.create({
        data: {
          medicalRecordId: record.id,
          date: new Date('2025-07-16T10:00:00.000Z'), // 👈 Remplacé createdAt par date
          visitReason: 'Check-up initial d’entrée',
          observations: 'Première visite. Patient globalement en bonne santé. Prise de contact.',
          biometricMeasures: JSON.stringify({ temperature: 36.6, heartRate: 72, bloodPressure: '122/80' }),
        }
      });

      // Consultation 2 : Intermédiaire (Il y a 6 mois)
      await prisma.consultation.create({
        data: {
          medicalRecordId: record.id,
          date: new Date('2026-01-15T09:15:00.000Z'), // 👈 Remplacé createdAt par date
          visitReason: 'Syndrome grippal',
          observations: 'Fièvre modérée, courbatures et fatigue intense depuis 48h. Repos prescrit.',
          biometricMeasures: JSON.stringify({ temperature: 38.2, heartRate: 80, bloodPressure: '118/75' }),
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

      // Consultation 3 : La plus récente (Aujourd'hui)
      await prisma.consultation.create({
        data: {
          medicalRecordId: record.id,
          date: new Date('2026-07-16T14:00:00.000Z'), // 👈 Remplacé createdAt par date
          visitReason: 'Contrôle annuel de routine',
          observations: 'Patient en excellente forme physique. Récupération post-grippale parfaite. Pratique une activité sportive régulière.',
          biometricMeasures: JSON.stringify({ temperature: 36.7, heartRate: 68, bloodPressure: '120/80' }),
        }
      });
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Cas 2 : Jean Dupont Bis (Senior - 2 consultations pour tester le suivi d'une maladie chronique)
    // -----------------------------------------------------------------------------------------------------------------
    else if (record.patient?.user.email === 'jean.dupont.bis@test.com') {
      
      // Consultation 1 : Bilan initial (Il y a 6 mois)
      await prisma.consultation.create({
        data: {
          medicalRecord: {
            connect: { id: record.id }
          },
          date: new Date('2026-01-10T11:00:00.000Z'), // 👈 Remplacé createdAt par date
          visitReason: 'Bilan de découverte - Diabète de type 2',
          observations: 'Découverte fortuite de glycémies à jeun élevées. Mise en place d’un protocole diététique et thérapeutique initial.',
          biometricMeasures: JSON.stringify({ temperature: 36.4, heartRate: 75, bloodPressure: '140/88' }),
          aiAnalysis: {
            create: {
              riskScore: 55.0,
              riskClass: RiskClass.Moderate,
              message: 'Risque cardiovasculaire modéré d’entrée de jeu en raison de l’âge (68 ans) et du profil glycémique.'
            }
          }
        }
      });

      // Consultation 2 : Suivi trimestriel actuel (Aujourd'hui)
      await prisma.consultation.create({
        data: {
          medicalRecord: {
            connect: { id: record.id }
          },
          date: new Date('2026-07-16T10:30:00.000Z'), // 👈 Remplacé createdAt par date
          visitReason: 'Suivi trimestriel diabète et cardiologie',
          observations: 'Légers picotements signalés aux extrémités. Tension légèrement élevée mais stable par rapport au dernier contrôle.',
          biometricMeasures: JSON.stringify({ temperature: 36.5, heartRate: 78, bloodPressure: '138/85' }),
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
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Cas 3 : Patricia Martinez (Asthme)
    // -----------------------------------------------------------------------------------------------------------------
    else if (record.patient?.user.email === 'pat.martinez@test.com') {
      await prisma.consultation.create({
        data: {
          medicalRecordId: record.id,
          visitReason: 'Suivi de crise d’asthme saisonnière',
          observations: 'Sifflements bronchiques légers entendus à l’auscultation.',
          biometricMeasures: JSON.stringify({ temperature: 36.8, heartRate: 72, bloodPressure: '115/75' }),
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
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Cas 4 : Patrick Paterson (Hypercholestérolémie, Obésité)
    // -----------------------------------------------------------------------------------------------------------------
    else if (record.patient?.user.email === 'patrick.paterson@test.com') {
      await prisma.consultation.create({
        data: {
          medicalRecord: {
            connect: { id: record.id }
          },
          visitReason: 'Bilan lipidique et douleurs thoraciques d’effort',
          observations: 'Patient se plaint d’oppressions thoraciques lors d’efforts modérés. Perte de poids fortement recommandée.',
          biometricMeasures: JSON.stringify({ temperature: 36.6, heartRate: 85, bloodPressure: '145/92' }),
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
                    duration: '6 months',
                    medicationId: kardegic.id,
                    equipmentId: bloodPressureMonitor.id
                  }
                ]
              }
            }
          }
        }
      });
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Cas 5 : Marie Durand (Senior, Ostéoporose)
    // -----------------------------------------------------------------------------------------------------------------
    else if (record.patient?.user.email === 'marie.durand@test.com') {
      await prisma.consultation.create({
        data: {
          medicalRecordId: record.id,
          visitReason: 'Douleurs articulaires diffuses',
          observations: 'Mobilité difficile. Douleur d’arthrose accrue due au froid.',
          biometricMeasures: JSON.stringify({ temperature: 36.2, heartRate: 70, bloodPressure: '130/80' }),
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
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Cas 6 : Arthur Le Pennec (Jeune patient)
    // -----------------------------------------------------------------------------------------------------------------
    else if (record.patient?.user.email === 'arthur.lp@test.com') {
      await prisma.consultation.create({
        data: {
          medicalRecordId: record.id,
          visitReason: 'Suivi de posture (scoliose)',
          observations: 'Pas d’aggravation de la courbure. Continuer les exercices physiques.',
          biometricMeasures: JSON.stringify({ temperature: 36.6, heartRate: 62, bloodPressure: '110/70' })
        }
      });
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Cas 7 : Chantal Gomez (Obésité classe 2, Suivi apnée)
    // -----------------------------------------------------------------------------------------------------------------
    else if (record.patient?.user.email === 'chantal.gomez@test.com') {
      await prisma.consultation.create({
        data: {
          medicalRecord: {
            connect: { id: record.id }
          },
          visitReason: 'Fatigue diurne et suivi sommeil',
          observations: 'Somnolence résiduelle persistante. L’appareil PPC est bien supporté.',
          biometricMeasures: JSON.stringify({ temperature: 36.4, heartRate: 74, bloodPressure: '135/88' }),
          aiAnalysis: {
            create: {
              riskScore: 45.0,
              riskClass: RiskClass.Moderate,
              message: 'Risque modéré lié à l’apnée obstructive du sommeil.'
            }
          }
        }
      });
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Cas 8 : Jean Rey (Contrôle post-opératoire simple)
    // -----------------------------------------------------------------------------------------------------------------
    else if (record.patient?.user.email === 'jean.rey@test.com') {
      await prisma.consultation.create({
        data: {
          medicalRecordId: record.id,
          visitReason: 'Contrôle post-appendicectomie',
          observations: 'Cicatrice saine, propre et solide. Reprise totale des activités physiques autorisée.',
          biometricMeasures: JSON.stringify({ temperature: 36.7, heartRate: 66, bloodPressure: '120/75' })
        }
      });
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Cas 9 : Lucas Dubois (Patient en attente/Pending)
    // -----------------------------------------------------------------------------------------------------------------
    else if (record.patient?.user.email === 'lucas.pending@test.com') {
      await prisma.consultation.create({
        data: {
          medicalRecordId: record.id,
          visitReason: 'Suivi de fracture du scaphoïde',
          observations: 'Plâtre en bon état. Pas de douleur signalée.',
          biometricMeasures: JSON.stringify({ temperature: 36.8, heartRate: 64, bloodPressure: '118/78' })
        }
      });
    }

    console.log(` ✅ Consultation(s) générée(s) pour le dossier de : ${patientName}`);
  }

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