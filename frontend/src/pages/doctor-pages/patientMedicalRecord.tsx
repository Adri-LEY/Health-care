import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    FileText,
    AlertTriangle,
    Scale,
    Ruler,
    Droplets,
    Calculator,
    Users
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
    const [loading, setLoading] = useState(true);

    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchRecord = async () => {
            try {
                const response = await fetch(`${apiUrl}/patients/medicalRecord/${patientId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const json = await response.json();
                setData(json.data);
            } catch (error) {
                console.error("Erreur lors du chargement du dossier :", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRecord();
    }, [patientId, apiUrl]);

    if (loading) return <div className={styles.loading}>Chargement du dossier médical...</div>;
    if (!data) return <div className={styles.error}>Dossier introuvable.</div>;

    return (
        <div className={styles.container}>
            {/* Header avec bouton retour */}
            <div className={styles.header}>
                <button className={styles.backButton} onClick={() => navigate("/doctor/patientResearch")}>
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
                <PatientSidebar patient={data} />

                {/* Colonne Droite : Données Médicales */}
                <div className={styles.mainContent}>

                    {/* Section Biométrie (Poids, Taille, IMC) */}
                    <div className={styles.metricsGrid}>
                        <MetricCard
                            icon={<Scale className={styles.icon} />}
                            label="Poids"
                            value={`${data.medicalRecord.poids} kg`}
                        />
                        <MetricCard
                            icon={<Ruler className={styles.iconBlue} />}
                            label="Taille"
                            value={`${data.medicalRecord.taille} cm`}
                        />
                        <MetricCard
                            icon={<Droplets className={styles.iconRed} />}
                            label="Groupe Sanguin"
                            value={data.medicalRecord.bloodType}
                        />
                        <MetricCard
                            icon={<Calculator className={styles.iconGreen} />}
                            label="Statut IMC"
                            value={IMCStatusMap[data.medicalRecord.imc] || data.medicalRecord.imc.replace('_', ' ')}
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