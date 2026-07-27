import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  PlusCircle,
  Activity,
  Thermometer,
  Heart,
  Scale,
  Ruler,
  Percent,
  Droplet
} from 'lucide-react';
import styles from './addConsultation.module.css';
import { PatientSidebar } from '../../components/PatientSideBar';
import InputField from '../../components/InputField';
import { ErrorBox } from '../../components/ErrorBox';
import { PrescriptionForm } from '../../components/consultations/PrescriptionForm';
import type { ElementPrescriptionItem, CatalogItem } from '../../components/consultations/PrescriptionForm';
import { MetricCard } from '../../components/MetricCard';

// Mappeur pour associer dynamiquement l'icône et l'intitulé selon le type Prisma
const MEASURE_CONFIG: Record<string, { label: string; icon: React.ReactNode }> = {
  TEMPERATURE: { label: 'Température', icon: <Thermometer size={18} color="#f97316" /> },
  HEART_RATE: { label: 'Fréquence cardiaque', icon: <Heart size={18} color="#ef4444" /> },
  BLOOD_PRESSURE: { label: 'Tension artérielle', icon: <Activity size={18} color="#3b82f6" /> },
  WEIGHT: { label: 'Poids', icon: <Scale size={18} color="#8b5cf6" /> },
  HEIGHT: { label: 'Taille', icon: <Ruler size={18} color="#10b981" /> },
  OXYGEN_SATURATION: { label: 'SpO2', icon: <Percent size={18} color="#06b6d4" /> },
  BLOOD_GLUCOSE: { label: 'Glycémie', icon: <Droplet size={18} color="#eab308" /> },
};

export default function AddConsultation() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  const [patientData, setPatientData] = useState<any | null>(null);
  const [loadingPatient, setLoadingPatient] = useState(true);

  // Formulaire Consultation
  const [visitReason, setVisitReason] = useState('');
  const [observations, setObservations] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string | string[]>([]);

  // États du Catalogue & Ordonnance
  const [showPrescription, setShowPrescription] = useState(false);
  const [prescriptionItems, setPrescriptionItems] = useState<ElementPrescriptionItem[]>([]);
  const [medicationsList, setMedicationsList] = useState<CatalogItem[]>([]);
  const [equipmentsList, setEquipmentsList] = useState<CatalogItem[]>([]);
  const [caresList, setCaresList] = useState<CatalogItem[]>([]);

  // 👈 NOUVEAU : Biométrie récente & Sélection
  const [recentBiometrics, setRecentBiometrics] = useState<any[]>([]);
  const [selectedMeasureIds, setSelectedMeasureIds] = useState<number[]>([]);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const fetchPatientAndData = async () => {
      try {
        const response = await fetch(`${apiUrl}/patients/medicalRecord/${patientId}`, { headers });
        const json = await response.json();
        const patient = json.data;
        setPatientData(patient);

        if (patient?.medicalRecord?.id) {
          // Chargement parallèle des catalogues ET des constantes récentes non liées
          const [medRes, eqRes, careRes, biometricsRes] = await Promise.all([
            fetch(`${apiUrl}/prescription-catalog/medications`, { headers }),
            fetch(`${apiUrl}/prescription-catalog/equipments`, { headers }),
            fetch(`${apiUrl}/prescription-catalog/cares`, { headers }),
            fetch(`${apiUrl}/biometrics/recent/${patient.medicalRecord.id}`, { headers }),
          ]);

          if (medRes.ok) setMedicationsList(await medRes.json());
          if (eqRes.ok) setEquipmentsList(await eqRes.json());
          if (careRes.ok) setCaresList(await careRes.json());

          if (biometricsRes.ok) {
            const bioData = await biometricsRes.json();
            const measures = Array.isArray(bioData) ? bioData : (bioData.measures || []);
            setRecentBiometrics(measures);

            setSelectedMeasureIds(measures.map((m: any) => m.id));
          }
        }
      } catch (err) {
        console.error("Erreur de chargement des données", err);
      } finally {
        setLoadingPatient(false);
      }
    };

    fetchPatientAndData();
  }, [patientId, apiUrl]);

  // Gestion du basculement (Toggle) individuel
  const toggleMeasure = (id: number) => {
    setSelectedMeasureIds(prev =>
      prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]
    );
  };

  // Gestion du "Tout Cocher / Tout Décocher"
  const toggleSelectAll = () => {
    if (selectedMeasureIds.length === recentBiometrics.length) {
      setSelectedMeasureIds([]); // Tout décocher
    } else {
      setSelectedMeasureIds(recentBiometrics.map(m => m.id)); // Tout cocher
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessages([]);

    if (!patientData?.medicalRecord?.id) {
      setErrorMessages("Dossier médical introuvable.");
      setSubmitting(false);
      return;
    }

    // Construction du Payload enrichi
    const payload: any = {
      medicalRecordId: patientData.medicalRecord.id,
      date: new Date().toISOString(),
      visitReason,
      observations,
      biometricMeasureIds: selectedMeasureIds, // 👈 Transmission des constantes rattachées !
    };

    if (showPrescription && prescriptionItems.length > 0) {
      payload.prescription = {
        elements: prescriptionItems.map((item) => ({
          name: item.name,
          description: item.description,
          dosage: item.dosage,
          duration: item.duration,
          medicationId: item.medicationId,
          equipmentId: item.equipmentId,
          careId: item.careId,
        })),
      };
    }

    try {
      const response = await fetch(`${apiUrl}/consultations/save-consultation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await response.json();

      if (!response.ok) {
        setErrorMessages(json.message || "Une erreur inattendue est survenue.");
        return;
      }

      const newConsultationId = json.data?.id;
      const response2 = await fetch(`${apiUrl}/biometrics/link-consultation/${newConsultationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ biometricIds: selectedMeasureIds }),
      });

      if(!response2.ok) {
        setErrorMessages("Erreur lors de la liaison des constantes biométriques à la consultation.");
        return;
      }

      navigate(`/patient/medicalRecord/consultations/${patientData.medicalRecord.id}`);
    } catch (err) {
      setErrorMessages("Erreur réseau. Veuillez vérifier votre connexion.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingPatient) return <div className={styles.loading}>Chargement des informations du patient...</div>;
  if (!patientData) return <div className={styles.container}><div className={styles.errorBox}>Patient introuvable.</div></div>;

  const allSelected = recentBiometrics.length > 0 && selectedMeasureIds.length === recentBiometrics.length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(`/patient/medicalRecord/${patientData.medicalRecord.id}`)}>
          <ArrowLeft size={18} /> Retour
        </button>
        <div className={styles.titleSection}>
          <h1>Nouvelle Consultation</h1>
          <span className={styles.patientBadge}>ID Patient: #{patientData.id}</span>
        </div>
      </div>

      <div className={styles.dashboardGrid}>
        <PatientSidebar patient={patientData} isDoctor={true} currentDoctorId={patientData.doctor?.id || null} />

        <div className={styles.mainContent}>
          <ErrorBox messages={errorMessages} />

          <div className={styles.formCard}>
            <h2>Saisie des observations cliniques</h2>

            <form onSubmit={handleSubmit} className={styles.form}>

              {/* BLOC SELECTION DES CONSTANTES RECENTES */}
              {recentBiometrics.length > 0 && (
                <div className={styles.biometricsSection}>
                  <div className={styles.biometricsHeader}>
                    <span className={styles.biometricsTitle}>
                      <Activity size={18} />
                      Constantes récentes saisies (Tri)
                    </span>
                    <label className={styles.selectAllLabel}>
                      <input
                        type="checkbox"
                        className={styles.checkboxInput}
                        checked={allSelected}
                        onChange={toggleSelectAll}
                      />
                      Tout cocher
                    </label>
                  </div>

                  <div className={styles.biometricsGrid}>
                    {recentBiometrics.map((m) => {
                      const isChecked = selectedMeasureIds.includes(m.id);
                      const config = MEASURE_CONFIG[m.type] || { label: m.type, icon: <Activity size={18} /> };

                      return (
                        <div
                          key={m.id}
                          className={`${styles.selectableWrapper} ${isChecked ? styles.selected : ''}`}
                          onClick={() => toggleMeasure(m.id)}
                        >
                          <input
                            type="checkbox"
                            className={styles.checkboxInput}
                            checked={isChecked}
                            onChange={() => { }} // Le clic global gère le toggle
                          />

                          {/* 👈 Utilisation directe de ta MetricCard */}
                          <MetricCard
                            icon={config.icon}
                            label={config.label}
                            value={m.value}
                            unit={m.unit}
                            className={styles.customMetricCard}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <InputField
                label="Motif de la visite"
                type="text"
                value={visitReason}
                onChange={setVisitReason}
                required
                subtext="Exemple : Consultation de suivi, Syndrome grippal..."
              />

              <InputField
                label="Observations médicales"
                type="textarea"
                rows={6}
                value={observations}
                onChange={setObservations}
                required
                subtext="Détails cliniques, examens..."
              />

              <PrescriptionForm
                showPrescription={showPrescription}
                setShowPrescription={setShowPrescription}
                items={prescriptionItems}
                setItems={setPrescriptionItems}
                medicationsList={medicationsList}
                equipmentsList={equipmentsList}
                caresList={caresList}
              />

              <div className={styles.actions}>
                <button type="submit" className={styles.submitButton} disabled={submitting}>
                  <PlusCircle size={18} />
                  {submitting ? 'Enregistrement...' : 'Valider la consultation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}