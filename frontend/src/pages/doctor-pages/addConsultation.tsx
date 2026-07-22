import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import styles from './addConsultation.module.css';
import { PatientSidebar } from '../../components/PatientSideBar';
import InputField from '../../components/InputField';
import { ErrorBox } from '../../components/ErrorBox';


export default function AddConsultation() {
    const { patientId } = useParams<{ patientId: string }>();
    const navigate = useNavigate();
    
    // États pour les données du patient (Sidebar requis)
    const [patientData, setPatientData] = useState<any | null>(null);
    const [loadingPatient, setLoadingPatient] = useState(true);

    // États du formulaire de consultation
    const [visitReason, setVisitReason] = useState('');
    const [observations, setObservations] = useState('');
    const [submitting, setSubmitting] = useState(false);
    
    // Gestion des erreurs de l'API (Tableau de chaînes de class-validator)
    const [errorMessages, setErrorMessages] = useState<string | string[]>([]);

    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        // Chargement du dossier pour alimenter le volet gauche (Sidebar)
        const fetchPatient = async () => {
            try {
                const response = await fetch(`${apiUrl}/patients/medicalRecord/${patientId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const json = await response.json();
                setPatientData(json.data);
            } catch (err) {
                console.error("Impossible de récupérer les infos du patient", err);
            } finally {
                setLoadingPatient(false);
            }
        };
        fetchPatient();
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

        // Payload respectant le DTO NestJS (Sans biometrie pour le moment)
        const payload = {
            medicalRecordId: patientData.medicalRecord.id,
            date: new Date().toISOString(), // Sauvegarde avec précision DateTime
            visitReason,
            observations
        };

        try {
            const response = await fetch(`${apiUrl}/consultations/save-consultation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(payload)
            });

            const json = await response.json();

            if (!response.ok) {
                // Si class-validator renvoie un tableau de messages d'erreurs
                if (json.message) {
                    setErrorMessages(json.message);
                } else {
                    setErrorMessages("Une erreur inattendue est survenue.");
                }
                return;
            }

            // Succès : retour à l'historique ou dossier médical
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
            {/* Entête de page avec bouton retour */}
            <div className={styles.header}>
                <button className={styles.backButton} onClick={() => navigate(`/patient/medicalRecord/${patientData.medicalRecord.id}`)}>
                    <ArrowLeft size={18} /> Retour
                </button>
                <div className={styles.titleSection}>
                    <h1>Nouvelle Consultation</h1>
                    <span className={styles.patientBadge}>
                        ID Patient: #{patientData.id}
                    </span>
                </div>
            </div>

            <div className={styles.dashboardGrid}>
                {/* Colonne Gauche : Sidebar Médical existant */}
                <PatientSidebar 
                    patient={patientData} 
                    isDoctor={true} 
                    currentDoctorId={patientData.doctor?.id || null} 
                />

                {/* Colonne Droite : Formulaire d'ajout */}
                <div className={styles.mainContent}>
                    
                    {/* Affichage de la boîte rouge d'erreur si class-validator rejette la saisie */}
                    <ErrorBox messages={errorMessages} />

                    <div className={styles.formCard}>
                        <h2>Saisie des observations cliniques</h2>
                        
                        <form onSubmit={handleSubmit} className={styles.form}>
                            
                            {/* Input standard pour le motif de la visite */}
                            <InputField
                                label="Motif de la visite"
                                type="text"
                                value={visitReason}
                                onChange={setVisitReason}
                                required
                                subtext="Exemple : Consultation de suivi post-opératoire, Syndrome grippal..."
                            />

                            {/* Zone de texte sur-mesure pour les observations détaillées */}
                            <InputField
                                label="Observations médicales"
                                type="textarea"
                                rows={8}
                                value={observations}
                                onChange={setObservations}
                                required
                                subtext="Détails cliniques, résultats d'examens, recommandations..."
                            />

                            {/* Actions du formulaire */}
                            <div className={styles.actions}>
                                <button 
                                    type="submit" 
                                    className={styles.submitButton}
                                    disabled={submitting}
                                >
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