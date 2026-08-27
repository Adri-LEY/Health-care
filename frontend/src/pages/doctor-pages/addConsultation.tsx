import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  PlusCircle,
} from 'lucide-react';
import styles from './addConsultation.module.css';
import { PatientSideBar } from '../../components/PatientSideBar';
import InputField from '../../components/InputField';
import { ErrorBox } from '../../components/ErrorBox';
import { PrescriptionForm } from '../../components/consultations/PrescriptionForm';
import type { ElementPrescriptionItem, CatalogItem } from '../../components/consultations/PrescriptionForm';
import AddConsultationBiometrics from '../../components/consultations/AddConsultationBiometrics';
import type { ConsultationBiometricMeasure } from '../../components/consultations/AddConsultationBiometrics';
import { AiPredictionSection } from '../../components/AI/AIPredictionSection';
import type { AiPredictionResult } from '../../components/AI/AIPredictionSection';

export default function AddConsultation() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = typeof location.state?.returnTo === 'string' ? location.state.returnTo : '/patientResearch';

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

  // Biométrie récente & Sélection
  const [recentBiometrics, setRecentBiometrics] = useState<ConsultationBiometricMeasure[]>([]);
  const [selectedMeasureIds, setSelectedMeasureIds] = useState<number[]>([]);

  // Historique biométrique & affichage
  const [biometricHistory, setBiometricHistory] = useState<ConsultationBiometricMeasure[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // Résultat de la prédiction AI
  const [aiPredictionResult, setAiPredictionResult] = useState<AiPredictionResult | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  // 👈 Fusion unique pour un accès rapide aux mesures (récentes + historique)
  const combinedBiometrics = useMemo(() => {
    const map = new Map<number, ConsultationBiometricMeasure>();
    recentBiometrics.forEach(m => map.set(m.id, m));
    biometricHistory.forEach(m => map.set(m.id, m));
    return Array.from(map.values());
  }, [recentBiometrics, biometricHistory]);

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
          const [medRes, eqRes, careRes, biometricsRes, biometricsHistoryRes] = await Promise.all([
            fetch(`${apiUrl}/prescription-catalog/medications`, { headers }),
            fetch(`${apiUrl}/prescription-catalog/equipments`, { headers }),
            fetch(`${apiUrl}/prescription-catalog/cares`, { headers }),
            fetch(`${apiUrl}/biometrics/recent/${patient.medicalRecord.id}`, { headers }),
            fetch(`${apiUrl}/biometrics/history/${patient.medicalRecord.id}`, { headers }),
          ]);

          if (medRes.ok) setMedicationsList(await medRes.json());
          if (eqRes.ok) setEquipmentsList(await eqRes.json());
          if (careRes.ok) setCaresList(await careRes.json());

          if (biometricsRes.ok) {
            const bioData = await biometricsRes.json();
            const measures = Array.isArray(bioData) ? bioData : (bioData.measures || []);
            setRecentBiometrics(measures);

            // Validation par défaut des récentes
            setSelectedMeasureIds(measures.map((m: ConsultationBiometricMeasure) => m.id));
          }

          if (biometricsHistoryRes.ok) {
            const historyData = await biometricsHistoryRes.json();
            const biometricsHist = Array.isArray(historyData) ? historyData : [];
            setBiometricHistory(biometricsHist);
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

  // 👈 Gestion intelligente de la sélection (Empêche deux données du même type)
  const toggleMeasure = (id: number) => {
    const targetMeasure = combinedBiometrics.find(m => m.id === id);
    if (!targetMeasure) return;

    setSelectedMeasureIds(prev => {
      const isAlreadySelected = prev.includes(id);

      if (isAlreadySelected) {
        // Décocher simplement
        return prev.filter(mId => mId !== id);
      } else {
        // Décocher tout autre élément possédant le MÊME type
        const filtered = prev.filter(mId => {
          const m = combinedBiometrics.find(item => item.id === mId);
          return m ? m.type !== targetMeasure.type : true;
        });

        // Ajouter la nouvelle mesure sélectionnée
        return [...filtered, id];
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectedMeasureIds.length === recentBiometrics.length) {
      setSelectedMeasureIds([]);
    } else {
      setSelectedMeasureIds(recentBiometrics.map(m => m.id));
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

    const biometricMeasuresObj: Record<string, any> = {};

    selectedMeasureIds.forEach(id => {
      const measure = combinedBiometrics.find(m => m.id === id);
      if (!measure) return;

      const val = measure.value !== undefined ? Number(measure.value) : measure.stringValue;

      if (measure.type === 'TEMPERATURE') biometricMeasuresObj.temperature = val;
      if (measure.type === 'HEART_RATE') biometricMeasuresObj.heartRate = val;
      if (measure.type === 'BLOOD_PRESSURE') biometricMeasuresObj.bloodPressure = String(val);
      if (measure.type === 'WEIGHT') biometricMeasuresObj.weight = val;
      if (measure.type === 'HEIGHT') biometricMeasuresObj.height = val;
      if (measure.type === 'OXYGEN_SATURATION') biometricMeasuresObj.oxygenSaturation = val;
      if (measure.type === 'BLOOD_GLUCOSE') biometricMeasuresObj.bloodGlucose = val;
    });

    const payload: any = {
      medicalRecordId: Number(patientData.medicalRecord.id),
      date: new Date().toISOString(),
      visitReason,
      observations,
      biometricMeasures: biometricMeasuresObj,
    };

    if (aiPredictionResult) {
      payload.aiPredictionResult = {
        riskScore: Number(aiPredictionResult.riskScore),
        riskClass: aiPredictionResult.riskClass,
        message: aiPredictionResult.message ?? "",
      };
    }

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

      if (!response2.ok) {
        setErrorMessages("Erreur lors de la liaison des constantes biométriques à la consultation.");
        return;
      }

      navigate(`/patient/medicalRecord/consultations/${patientData.medicalRecord.id}`, { state: { returnTo } });
    } catch (err) {
      setErrorMessages("Erreur réseau. Veuillez vérifier votre connexion.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingPatient) return <div className={styles.loading}>Chargement des informations du patient...</div>;
  if (!patientData) return <div className={styles.container}><div className={styles.errorBox}>Patient introuvable.</div></div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(`/patient/medicalRecord/${patientData.medicalRecord.id}`, { state: { returnTo } })}>
          <ArrowLeft size={18} /> Retour
        </button>
        <div className={styles.titleSection}>
          <h1>Nouvelle Consultation</h1>
          <span className={styles.patientBadge}>ID Patient: #{patientData.id}</span>
        </div>
      </div>

      <div className={styles.dashboardGrid}>
        <PatientSideBar patient={patientData} isDoctor={true} currentDoctorId={patientData.doctor?.id || null} />

        <div className={styles.mainContent}>
          <ErrorBox messages={errorMessages} />

          <div className={styles.formCard}>
            <h2>Saisie des observations cliniques</h2>

            <form onSubmit={handleSubmit} className={styles.form}>

              <AddConsultationBiometrics
                recentBiometrics={recentBiometrics}
                biometricHistory={biometricHistory}
                selectedMeasureIds={selectedMeasureIds}
                showHistory={showHistory}
                combinedBiometrics={combinedBiometrics}
                onToggleMeasure={toggleMeasure}
                onToggleSelectAll={toggleSelectAll}
                onToggleHistory={() => setShowHistory(prev => !prev)}
              />

              {/* 👈 Pass de combinedBiometrics à la section IA pour qu'elle inclue l'historique */}
              <AiPredictionSection
                patientId={Number(patientId)}
                recentBiometrics={combinedBiometrics}
                selectedMeasureIds={selectedMeasureIds}
                onPredictionChange={setAiPredictionResult}
              />

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