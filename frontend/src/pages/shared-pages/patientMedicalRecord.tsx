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
    History,
    PlusCircle,
    Edit3,
    Check,
    X
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
    const [isNurseAssistant, setIsNurseAssistant] = useState(false);
    const [currentDoctorId, setCurrentDoctorId] = useState<number | null>(null);

    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    // Formulaire d'édition pour ModifyMedicalRecordDto
    const [formData, setFormData] = useState({
        poids: '',
        taille: '',
        bloodType: '',
        medical_history: '',
        family_history: '',
        allergies: ''
    });

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

            // Pré-remplir le formulaire
            if (json.data?.medicalRecord) {
                const mr = json.data.medicalRecord;
                setFormData({
                    poids: mr.poids ? String(mr.poids) : '',
                    taille: mr.taille ? String(mr.taille) : '',
                    bloodType: mr.bloodType || '',
                    medical_history: mr.medical_history || '',
                    family_history: mr.family_history || '',
                    allergies: mr.allergies || ''
                });
            }

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
            setIsNurseAssistant(json.role === 'NURSE_ASSISTANT');
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


    // Soumission de la modification (POST /patients/:patientId/vitals)
    const handleSaveVitals = async () => {
        setSaving(true);
        try {
            const payload = {
                poids: formData.poids ? Number(formData.poids) : undefined,
                taille: formData.taille ? Number(formData.taille) : undefined,
                bloodType: formData.bloodType || undefined,
                medicalHistory: formData.medical_history,
                familyHistory: formData.family_history,
                allergies: formData.allergies,
            };

            const response = await fetch(`${apiUrl}/patients/${patientId}/vitals`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error("Erreur lors de la mise à jour du dossier.");
            }

            await fetchRecord(); // Rafraîchir les données
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            alert("Impossible de sauvegarder les modifications.");
        } finally {
            setSaving(false);
        }
    };


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

    // L'aide-soignante peut modifier le dossier.
    const canEdit = isNurseAssistant;

    return (
        <div className={styles.container}>
            {/* Header avec bouton retour */}
            <div className={styles.header}>
                <button className={styles.backButton} onClick={() => {
                    if (isDoctor || isNurseAssistant) {
                        navigate('/patientResearch');
                    }
                    else navigate('/patient');
                }}>
                    <ArrowLeft size={18} /> Retour
                </button>

                <div className={styles.titleSection}>
                    <h1>Dossier Médical</h1>


                    <div className={styles.titleActions}>
                        {/* Bouton d'édition pour l'Aide-Soignante / Médecin */}
                        {canEdit && !isEditing && (
                            <>
                                <button className={styles.newDataButton} onClick={() => navigate(`/patient/medicalRecord/${data.medicalRecord.id}/biometrics`)}>
                                    <Edit3 size={18} /> Renseigner données biométriques
                                </button>

                                <button
                                    className={styles.editButton}
                                    onClick={() => setIsEditing(true)}
                                >
                                    <Edit3 size={18} />
                                    Modifier le dossier
                                </button>
                            </>
                        )}

                        {/* Actions de sauvegarde si en mode édition */}
                        {isEditing && (
                            <>
                                <button className={styles.newDataButton} onClick={() => navigate(`/patient/medicalRecord/${data.medicalRecord.id}/biometrics`)}>
                                    <Edit3 size={18} /> Renseigner données biométriques
                                </button>

                                <button
                                    className={styles.cancelButton}
                                    onClick={() => setIsEditing(false)}
                                    disabled={saving}
                                >
                                    <X size={18} /> Annuler
                                </button>
                                <button
                                    className={styles.saveButton}
                                    onClick={handleSaveVitals}
                                    disabled={saving}
                                >
                                    <Check size={18} /> {saving ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                            </>
                        )}

                        <span className={styles.patientBadge}>
                            ID Patient: #{data.id}
                        </span>
                    </div>
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

                        {/* 2. Groupe les actions à droite */}
                        <div className={styles.actionBannerButtons}>
                            <button
                                className={styles.consultationHistoryButton}
                                onClick={() => navigate(`/patient/medicalRecord/consultations/${data.medicalRecord.id}`)}
                            >
                                <History size={18} />
                                Historique des consultations
                            </button>

                            {/* Le nouveau bouton pour le médecin */}
                            {isDoctor && (
                                <button
                                    className={styles.newConsultationButton}
                                    onClick={() => navigate(`/patient/medicalRecord/${data.medicalRecord.id}/add-consultation/${data.id}`)}
                                >
                                    <PlusCircle size={18} />
                                    Nouvelle consultation
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Section Biométrie (Poids, Taille, IMC) */}
                    <div className={styles.metricsGrid}>
                        {isEditing ? (
                            <>
                                <div className={styles.inputMetricCard}>
                                    <label><Scale size={16} className={styles.icon} /> Poids (kg)</label>
                                    <input
                                        type="number"
                                        value={formData.poids}
                                        onChange={(e) => setFormData({ ...formData, poids: e.target.value })}
                                        placeholder="ex: 70"
                                    />
                                </div>
                                <div className={styles.inputMetricCard}>
                                    <label><Ruler size={16} className={styles.iconBlue} /> Taille (cm)</label>
                                    <input
                                        type="number"
                                        value={formData.taille}
                                        onChange={(e) => setFormData({ ...formData, taille: e.target.value })}
                                        placeholder="ex: 175"
                                    />
                                </div>
                                <div className={styles.inputMetricCard}>
                                    <label><Droplets size={16} className={styles.iconRed} /> Groupe Sanguin</label>
                                    <select
                                        value={formData.bloodType}
                                        onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                                    >
                                        <option value="">Sélectionner</option>
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                        <option value="AB">AB</option>
                                        <option value="O">O</option>
                                    </select>
                                </div>
                            </>
                        ) : (
                            <>
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
                                    value={data.medicalRecord.bloodType ? data.medicalRecord.bloodType.replace('_', ' ') : 'Non renseigné'}
                                />
                            </>
                        )}

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
                        >
                            {isEditing ? (
                                <textarea
                                    className={styles.editTextarea}
                                    value={formData.allergies}
                                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                                    rows={3}
                                />
                            ) : (
                                data.medicalRecord.allergies || "Aucune allergie répertoriée."
                            )}
                        </RecordDetailCard>

                        <RecordDetailCard
                            icon={<FileText className={styles.icon} />}
                            title="Antécédents Médicaux"
                        >
                            {isEditing ? (
                                <textarea
                                    className={styles.editTextarea}
                                    value={formData.medical_history}
                                    onChange={(e) => setFormData({ ...formData, medical_history: e.target.value })}
                                    rows={3}
                                />
                            ) : (
                                data.medicalRecord.medical_history || "Aucun antécédent médical répertorié."
                            )}
                        </RecordDetailCard>

                        <RecordDetailCard
                            icon={<Users className={styles.icon} />}
                            title="Antécédents Familiaux"
                        >
                            {isEditing ? (
                                <textarea
                                    className={styles.editTextarea}
                                    value={formData.family_history}
                                    onChange={(e) => setFormData({ ...formData, family_history: e.target.value })}
                                    rows={3}
                                />
                            ) : (
                                data.medicalRecord.family_history || "Aucun antécédent familial répertorié."
                            )}
                        </RecordDetailCard>
                    </div>

                </div>
            </div>
        </div>
    );
}