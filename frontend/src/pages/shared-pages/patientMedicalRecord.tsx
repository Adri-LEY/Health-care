import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    FileText,
    AlertTriangle,
    Scale,
    Ruler,
    Droplets,
    Calculator,
    Users,
    History
} from 'lucide-react';
import styles from './patientMedicalRecord.module.css';
import { PatientSidebar } from '../../components/PatientSideBar';
import { MetricCard } from '../../components/MetricCard';
import { RecordDetailCard } from '../../components/RecordDetailCard';

interface MedicalRecord {
    id: number;
    poids: number;
    taille: number;
    bloodType: string;
    imc: string;
    medical_history: string;
    family_history: string;
    allergies: string;
}

interface PatientFullData {
    id: number;
    age: number;
    gender: string;
    birthDate: string;
    address: string;
    intern: boolean;
    user: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
    };
    medicalRecord: MedicalRecord;
    doctor?: {
        id: number;
        staff?: {
            user: {
                id: number;
                firstName: string;
                lastName: string;
                email: string;
                phone: string;
            };
        };
    };
}

const IMCStatusMap: { [key: string]: string } = {
    'UNDERWEIGHT': 'Insuffisance pondérale',
    'NORMAL_WEIGHT': 'Poids normal',
    'OVERWEIGHT': 'Surpoids',
    'OBESITY': 'Obésité',
    'CLASS_1_OBESITY': 'Obésité classe 1',
    'CLASS_2_OBESITY': 'Obésité classe 2',
    'CLASS_3_OBESITY': 'Obésité classe 3'
};

export default function PatientMedicalRecord() {
    const { patientId } = useParams<{ patientId: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<PatientFullData | null>(null);

    const [isDoctor, setIsDoctor] = useState(false);
    const [currentDoctorId, setCurrentDoctorId] = useState<number | null>(null);

    const [loading, setLoading] = useState(true);

    const apiUrl = import.meta.env.VITE_API_URL;


    const fetchRecord = async () => {
        try {
            const response = await fetch(`${apiUrl}/patients/medicalRecord/${patientId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const json = await response.json();
            console.log('Données du dossier médical récupérées :', json.data);
            setData(json.data);
        } catch (error) {
            console.error("Erreur lors du chargement du dossier :", error);
        } finally {
            setLoading(false);
        }
    };


    const fetchCurrentUserProfile = async () => {
        try {
            const response = await fetch(`${apiUrl}/users/profile`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const json = await response.json();

            console.log('Profil utilisateur récupéré :', json);

            setIsDoctor(json.role === 'DOCTOR');
            setCurrentDoctorId(json.userDetails?.doctor?.id || null);
        } catch (error) {
            console.error("Erreur lors du chargement du profil utilisateur :", error);
            return null;
        }
    };

    useEffect(() => {

        fetchCurrentUserProfile();
        fetchRecord();
    }, [patientId, apiUrl]);


    const onAssignDoctor = async (assign: boolean) => {
        if (assign) {
            try {
                const response = await fetch(`${apiUrl}/patients/assignDoctor`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ patientId: Number(patientId), doctorId: currentDoctorId })
                });
                const json = await response.json();
                if (!response.ok) {
                    throw new Error(json.message || 'Erreur lors de l\'affectation du médecin');
                }
                console.log('Médecin affecté avec succès !', json);

                // Mettre à jour l'état ou recharger les données
                fetchRecord(); // Recharger les données après l'affectation
            } catch (error) {
                console.error("Erreur lors de l'affectation du médecin :", error);
            }
        }

        else {
            try {
                const response = await fetch(`${apiUrl}/patients/unassignDoctor`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ patientId: Number(patientId) })
                });
                const json = await response.json();
                if (!response.ok) {
                    throw new Error(json.message || 'Erreur lors de la suppression de l\'affectation du médecin');
                }
                console.log('Médecin supprimé avec succès !', json);

                // Mettre à jour l'état ou recharger les données
                fetchRecord(); // Recharger les données après la suppression
            } catch (error) {
                console.error("Erreur lors de la suppression de l'affectation du médecin :", error);
            }
        }
    };

    if (loading) return <div className={styles.loading}>Chargement du dossier médical...</div>;
    if (!data) return <div className={styles.error}>Dossier introuvable.</div>;

    return (
        <div className={styles.container}>
            {/* Header avec bouton retour */}
            <div className={styles.header}>
                <button className={styles.backButton} onClick={() => {
                    if (isDoctor) {
                        navigate('/patientResearch');
                    }
                    else navigate('/patient');
                }}>
                    <ArrowLeft size={18} /> Retour
                </button>
                <div className={styles.titleSection}>
                    <h1>Dossier Médical</h1>
                    <span className={styles.patientBadge}>
                        ID Patient: #{data.id}
                    </span>
                </div>
            </div>

            <div className={styles.dashboardGrid}>

                {/* Colonne Gauche : Informations du Patient */}
                <PatientSidebar patient={data} isDoctor={isDoctor} currentDoctorId={currentDoctorId} onAssignDoctor={onAssignDoctor} />

                {/* Colonne Droite : Données Médicales */}
                <div className={styles.mainContent}>

                    <div className={styles.actionBanner}>
                        <div className={styles.actionBannerText}>
                            <h3>Suivi clinique du patient</h3>
                            <p>Consultez les comptes-rendus, les analyses de l'IA et les ordonnances délivrées.</p>
                        </div>
                        <button
                            className={styles.consultationHistoryButton}
                            onClick={() => navigate(`/patient/medicalRecord/consultations/${data.medicalRecord.id}`)}
                        >
                            <History size={18} />
                            Voir l'historique des consultations
                        </button>
                    </div>

                    {/* Section Biométrie (Poids, Taille, IMC) */}
                    <div className={styles.metricsGrid}>
                        <MetricCard
                            icon={<Scale className={styles.icon} />}
                            label="Poids"
                            value={data.medicalRecord.poids ? `${data.medicalRecord.poids} kg` : 'Non renseigné'}
                        />
                        <MetricCard
                            icon={<Ruler className={styles.iconBlue} />}
                            label="Taille"
                            value={data.medicalRecord.taille ? `${data.medicalRecord.taille} cm` : 'Non renseigné'}
                        />
                        <MetricCard
                            icon={<Droplets className={styles.iconRed} />}
                            label="Groupe Sanguin"
                            value={data.medicalRecord.bloodType ? data.medicalRecord.bloodType : 'Non renseigné'}
                        />
                        <MetricCard
                            icon={<Calculator className={styles.iconGreen} />}
                            label="Statut IMC"
                            value={data.medicalRecord.imc
                                ? (IMCStatusMap[data.medicalRecord.imc] || data.medicalRecord.imc.replace('_', ' '))
                                : 'Non renseigné'
                            }
                        />
                    </div>

                    {/* Section Antécédents et Allergies */}
                    <div className={styles.detailsGrid}>
                        <RecordDetailCard
                            icon={<AlertTriangle className={styles.icon} />}
                            title="Allergies"
                            children={data.medicalRecord.allergies || "Aucune allergie répertoriée."}
                        />

                        <RecordDetailCard
                            icon={<FileText className={styles.icon} />}
                            title="Antécédents Médicaux"
                            children={data.medicalRecord.medical_history || "Aucun antécédent médical répertorié."}
                        />

                        <RecordDetailCard
                            icon={<Users className={styles.icon} />}
                            title="Antécédents Familiaux"
                            children={data.medicalRecord.family_history || "Aucun antécédent familial répertorié."}
                        />
                    </div>

                </div>
            </div>
        </div>
    );
}