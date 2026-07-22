import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import styles from './addConsultation.module.css';
import { PatientSidebar } from '../../components/PatientSideBar';
import InputField from '../../components/InputField';
import { ErrorBox } from '../../components/ErrorBox';
import { PrescriptionForm } from '../../components/consultations/PrescriptionForm';
import type { ElementPrescriptionItem, CatalogItem } from '../../components/consultations/PrescriptionForm';

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

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    // 1. Récupération des données du patient
    const fetchPatient = async () => {
      try {
        const response = await fetch(`${apiUrl}/patients/medicalRecord/${patientId}`, { headers });
        const json = await response.json();
        setPatientData(json.data);
      } catch (err) {
        console.error("Impossible de récupérer les infos du patient", err);
      } finally {
        setLoadingPatient(false);
      }
    };

    // 2. Récupération des catalogues (médicaments, matériel, soins)
    const fetchCatalogs = async () => {
      try {
        const [medRes, eqRes, careRes] = await Promise.all([
          fetch(`${apiUrl}/prescription-catalog/medications`, { headers }),
          fetch(`${apiUrl}/prescription-catalog/equipments`, { headers }),
          fetch(`${apiUrl}/prescription-catalog/cares`, { headers }),
        ]);

        if (medRes.ok) setMedicationsList(await medRes.json());
        if (eqRes.ok) setEquipmentsList(await eqRes.json());
        if (careRes.ok) setCaresList(await careRes.json());
      } catch (err) {
        console.error("Erreur lors du chargement des catalogues", err);
      }
    };

    fetchPatient();
    fetchCatalogs();
  }, [patientId, apiUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessages([]);

    if (!patientData?.medicalRecord?.id) {
      setErrorMessages("Dossier médical introuvable.");
      setSubmitting(false);
      return;
    }

    // Construction du Payload en adéquation avec ConsultationSummaryDto
    const payload: any = {
      medicalRecordId: patientData.medicalRecord.id,
      date: new Date().toISOString(),
      visitReason,
      observations,
    };

    // Si une ordonnance a été remplie, on l'ajoute au payload
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

      navigate(`/patient/medicalRecord/consultations/${patientData.medicalRecord.id}`);
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

              {/* Sous-section Ordonnance insérée ici */}
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