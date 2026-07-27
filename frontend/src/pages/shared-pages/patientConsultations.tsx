import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Calendar,
    FileText,
    Activity,
    Brain,
    Pill,
    AlertTriangle,
    CheckCircle,
    Info,
    Thermometer,
    Heart,
    Percent
} from 'lucide-react';
import styles from './patientConsultations.module.css';
import { PatientSidebar } from '../../components/PatientSideBar';
import ConsultationHistory from '../../components/consultations/ConsultationHistory';
import BiometricSection from '../../components/consultations/BiometricSection';
import ObservationSection from '../../components/consultations/ObservationSection';
import AISection from '../../components/consultations/AISection';
import PrescriptionSection from '../../components/consultations/PrescriptionSection';

interface ConsultationListItem {
    id: number;
    date: string;
    visitReason: string;
}

interface PrescriptionItem {
    id: number;
    name: string;
    description: string;
    dosage: string;
    duration: string;
    careId?: number | null;
}

interface AiAnalysis {
    id: number;
    riskScore: number;
    riskClass: 'Low' | 'Moderate' | 'High' | string;
    message: string;
}

interface Biometrics {
    temperature?: number;
    heartRate?: number;
    bloodPressure?: string;
    weight?: number;
    height?: number;
    oxygenSaturation?: number;
    bloodGlucose?: number;
}

interface ConsultationDetails {
    id: number;
    date: string;
    visitReason: string;
    observations: string;
    biometricMeasures?: string | null;
    aiAnalysis?: AiAnalysis | null;
    prescription?: {
        id: number;
        prescriptionDate: string;
        prescriptionItems: PrescriptionItem[];
    } | null;
}

export default function PatientConsultations() {
    const { medicalRecordId } = useParams<{ medicalRecordId: string }>();
    const navigate = useNavigate();

    const [history, setHistory] = useState<ConsultationListItem[]>([]);
    const [selectedConsultationId, setSelectedConsultationId] = useState<number | null>(null);
    const [details, setDetails] = useState<ConsultationDetails | null>(null);

    const [loadingHistory, setLoadingHistory] = useState(true);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const apiUrl = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('token');

    // 1. Charger l'historique des consultations au montage
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                console.log("Fetching consultation history for medicalRecordId:", medicalRecordId);

                setLoadingHistory(true);
                const response = await fetch(`${apiUrl}/consultations/history/${medicalRecordId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const json = await response.json();

                console.log("Consultation history response:", json);

                if (response.ok && json.data) {
                    setHistory(json.data);
                    if (json.data.length > 0) {
                        // Sélectionner automatiquement la consultation la plus récente
                        setSelectedConsultationId(json.data[0].id);
                    }
                } else {
                    setError("Aucun historique de consultations trouvé.");
                }
            } catch (err) {
                setError("Erreur de communication avec le serveur.");
            } finally {
                setLoadingHistory(false);
            }
        };

        if (medicalRecordId) {
            fetchHistory();
        }
    }, [medicalRecordId, apiUrl, token]);

    // 2. Charger les détails à chaque fois qu'on sélectionne une consultation
    useEffect(() => {
        const fetchDetails = async () => {
            if (!selectedConsultationId) return;
            try {
                setLoadingDetails(true);
                const response = await fetch(`${apiUrl}/consultations/consultation-details/${selectedConsultationId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const json = await response.json();
                if (response.ok && json.data) {
                    setDetails(json.data);
                }
            } catch (err) {
                console.error("Erreur lors de la récupération du détail", err);
            } finally {
                setLoadingDetails(false);
            }
        };

        fetchDetails();
    }, [selectedConsultationId, apiUrl, token]);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const parseBiometrics = (jsonStr?: string | null): Biometrics | null => {
        if (!jsonStr) return null;
        try {
            return JSON.parse(jsonStr);
        } catch (e) {
            console.error("Erreur de parsing des mesures biométriques", e);
            return null;
        }
    };

    const biometrics = details ? parseBiometrics(details.biometricMeasures) : null;

    return (
        <div className={styles.layout}>

            <div className={styles.container}>
                {/* En-tête */}
                <div className={styles.header}>
                    <button
                        type="button"
                        className={styles.backButton}
                        onClick={() => navigate(`/patient/medicalRecord/${medicalRecordId}`)}
                    >
                        <ArrowLeft size={18} />
                        Retour au dossier médical
                    </button>
                    <h1 className={styles.pageTitle}>Historique des Consultations</h1>
                </div>

                {error ? (
                    <div className={styles.errorBanner}>
                        <Info size={20} /> {error}
                    </div>
                ) : (
                    <div className={styles.dashboardGrid}>
                        {/* COLONNE GAUCHE : LISTE DES CONSULTATIONS */}
                        <ConsultationHistory
                            loadingHistory={loadingHistory}
                            history={history}
                            selectedConsultationId={selectedConsultationId}
                            setSelectedConsultationId={setSelectedConsultationId}
                        />

                        {/* COLONNE DROITE : DETAILS DE LA CONSULTATION SELECTIONNEE */}
                        <div className={styles.detailsPane}>
                            {loadingDetails ? (
                                <div className={styles.spinnerContainer}>Mise à jour des détails...</div>
                            ) : details ? (
                                <div className={styles.detailsContent}>
                                    {/* Titre & Date de la Consultation */}
                                    <div className={styles.detailsHeader}>
                                        <div className={styles.titleInfo}>
                                            <span className={styles.detailLabel}>Motif de visite</span>
                                            <h2 className={styles.detailMainTitle}>{details.visitReason}</h2>
                                            <span className={styles.detailSubtitle}>Consulté le {formatDate(details.date)}</span>
                                        </div>
                                    </div>

                                    {/* 4. AJOUT : Section des constantes vitales (Biométrie) */}
                                    {biometrics && (
                                        <BiometricSection biometrics={biometrics} />
                                    )}

                                    {/* Section 1 : Observations médicales */}
                                    <ObservationSection observations={details.observations} />

                                    {/* Section 2 : Analyse d'intelligence artificielle */}
                                    {details.aiAnalysis && (
                                        <AISection aiAnalysis={details.aiAnalysis} />
                                    )}

                                    {/* Section 3 : Ordonnances & prescriptions */}
                                    <PrescriptionSection prescription={details.prescription ? details.prescription.prescriptionItems : []} />
                                </div>
                            ) : (
                                <div className={styles.noSelectionContainer}>
                                    <Activity size={48} className={styles.hugeIcon} />
                                    <p>Sélectionnez une consultation à gauche pour afficher ses détails.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}