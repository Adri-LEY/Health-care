import InputField from "../../components/InputField";
import styles from "./biometricsFormular.module.css";
import { useState, type FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
    Thermometer, 
    Heart, 
    Activity, 
    Scale, 
    Ruler, 
    Percent, 
    Droplet,
    ArrowLeft,
    CheckCircle2
} from "lucide-react";
import { ErrorBox } from "../../components/ErrorBox";

export function BiometricsFormular() {
    const user = localStorage.getItem('user');
    const nurseAssistantId = user ? JSON.parse(user).nurseAssistantId : null;

    const { medicalRecordId } = useParams<{ medicalRecordId: string }>();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        temperature: '',
        heartRate: '',
        bloodPressure: '',
        weight: '',
        height: '',
        oxygenSaturation: '',
        bloodGlucose: ''
    });

    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFieldChange = (field: keyof typeof formData) => (value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        // 1. Validation & conversion de medicalRecordId
        const recordId = medicalRecordId ? parseInt(medicalRecordId, 10) : NaN;
        if (isNaN(recordId)) {
            setError("L'identifiant du dossier médical (medicalRecordId) doit être un nombre valide.");
            return;
        }

        if (!nurseAssistantId) {
            setError("Identifiant de l'assistant(e) introuvable. Veuillez vous re-connecter.");
            return;
        }

        // 2. Transformation de formData en tableau respectant SingleMeasureDto
        const measures = [];

        if (formData.temperature) {
            measures.push({
                type: 'TEMPERATURE',
                value: parseFloat(formData.temperature),
                unit: '°C'
            });
        }
        if (formData.heartRate) {
            measures.push({
                type: 'HEART_RATE',
                value: parseFloat(formData.heartRate),
                unit: 'bpm'
            });
        }
        if (formData.bloodPressure) {
            measures.push({
                type: 'BLOOD_PRESSURE',
                value: parseFloat(formData.bloodPressure),
                unit: 'mmHg'
            });
        }
        if (formData.weight) {
            measures.push({
                type: 'WEIGHT',
                value: parseFloat(formData.weight),
                unit: 'kg'
            });
        }
        if (formData.height) {
            measures.push({
                type: 'HEIGHT',
                value: parseFloat(formData.height),
                unit: 'cm'
            });
        }
        if (formData.oxygenSaturation) {
            measures.push({
                type: 'OXYGEN_SATURATION',
                value: parseFloat(formData.oxygenSaturation),
                unit: '%'
            });
        }
        if (formData.bloodGlucose) {
            measures.push({
                type: 'BLOOD_GLUCOSE',
                value: parseFloat(formData.bloodGlucose),
                unit: 'g/L'
            });
        }

        if (measures.length === 0) {
            setError("Veuillez remplir au moins une mesure biométrique.");
            return;
        }

        // 3. Payload conforme à CreateBiometricMeasuresDto
        const payload = {
            medicalRecordId: recordId,
            measures: measures
        };

        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL;

            const response = await fetch(`${apiUrl}/biometrics/${nurseAssistantId}/add-measures`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Erreur de validation Backend :", errorData);

                const msg = Array.isArray(errorData.message) 
                    ? errorData.message.join(', ') 
                    : errorData.message || "Erreur lors de l'enregistrement des mesures biométriques.";
                throw new Error(msg);
            }

            // Message de succès et réinitialisation du formulaire
            setSuccessMessage("Les données biométriques ont été enregistrées avec succès !");
            setFormData({
                temperature: '',
                heartRate: '',
                bloodPressure: '',
                weight: '',
                height: '',
                oxygenSaturation: '',
                bloodGlucose: ''
            });

            new Promise(resolve => setTimeout(resolve, 2000)).then(() => {
                navigate(`/patient/medicalRecord/${recordId}`);
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement des mesures biométriques.");
            console.error("Erreur de connexion serveur", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className={styles.page}>
            <div className={styles.formContainer}>
                {/* Bouton retour vers le dossier médical du patient */}
                <button
                    type="button"
                    className={styles.backButton}
                    onClick={() => navigate(`/patient/medicalRecord/${medicalRecordId}`)}
                >
                    <ArrowLeft size={18} />
                    Retour au dossier médical
                </button>

                <h2 className={styles.formTitle}>Formulaire de biométrie</h2>
                <p className={styles.formSubtitle}>Renseignez les constantes vitales du patient.</p>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <InputField 
                            label="Température (°C)" 
                            value={formData.temperature} 
                            type="number" 
                            name="temperature" 
                            subtext="Ex: 37.5"
                            icon={<Thermometer className={styles.iconTemp} size={18} />}
                            onChange={handleFieldChange('temperature')} 
                        />
                        <InputField 
                            label="Fréquence cardiaque (bpm)" 
                            value={formData.heartRate} 
                            type="number" 
                            name="heartRate" 
                            subtext="Ex: 72"
                            icon={<Heart className={styles.iconHeart} size={18} />}
                            onChange={handleFieldChange('heartRate')} 
                        />
                        <InputField 
                            label="Tension artérielle (mmHg)" 
                            value={formData.bloodPressure} 
                            type="number" 
                            name="bloodPressure" 
                            subtext="Ex: 120"
                            icon={<Activity className={styles.iconPressure} size={18} />}
                            onChange={handleFieldChange('bloodPressure')} 
                        />
                        <InputField 
                            label="Poids (kg)" 
                            value={formData.weight} 
                            type="number" 
                            name="weight" 
                            subtext="Ex: 70.5"
                            icon={<Scale className={styles.iconWeight} size={18} />}
                            onChange={handleFieldChange('weight')} 
                        />
                        <InputField 
                            label="Taille (m)" 
                            value={formData.height} 
                            type="number" 
                            name="height" 
                            subtext="Ex: 1.75"
                            icon={<Ruler className={styles.iconHeight} size={18} />}
                            onChange={handleFieldChange('height')} 
                        />
                        <InputField 
                            label="Saturation en oxygène (%)" 
                            value={formData.oxygenSaturation} 
                            type="number" 
                            name="oxygenSaturation" 
                            subtext="Ex: 98"
                            icon={<Percent className={styles.iconOxygen} size={18} />}
                            onChange={handleFieldChange('oxygenSaturation')} 
                        />
                        <InputField 
                            label="Glycémie (g/L)" 
                            value={formData.bloodGlucose} 
                            type="number" 
                            name="bloodGlucose" 
                            subtext="Ex: 0.95"
                            icon={<Droplet className={styles.iconGlucose} size={18} />}
                            onChange={handleFieldChange('bloodGlucose')} 
                        />
                    </div>
        
                    {error && (<ErrorBox messages={error} />)}

                    {successMessage && (
                        <div className={styles.successBanner}>
                            <CheckCircle2 size={20} />
                            <span>{successMessage}</span>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className={styles.submitButton}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Enregistrement..." : "Enregistrer la biométrie"}
                    </button>
                </form>
            </div>
        </main>
    );
}