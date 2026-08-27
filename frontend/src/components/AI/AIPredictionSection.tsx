// src/components/consultations/AiPredictionSection.tsx
import React, { useState } from 'react';
import { Sparkles, CheckCircle2, XCircle, AlertTriangle, Cigarette, Wine, Activity, Brain } from 'lucide-react';
import styles from './aiPredictionSection.module.css';

interface Measure {
    id: number;
    type: string;
    value?: number;
    stringValue?: string;
    unit?: string;
}

export interface AiPredictionResult {
    riskScore: number;
    riskClass: 'Low' | 'Moderate' | 'High' | string;
    message: string;
    raw_prediction: number;
}

interface AiPredictionSectionProps {
    patientId: number | undefined;
    recentBiometrics: Measure[];
    selectedMeasureIds: number[];
    onPredictionChange: (result: AiPredictionResult | null) => void;
}

export const AiPredictionSection: React.FC<AiPredictionSectionProps> = ({
    patientId,
    recentBiometrics,
    selectedMeasureIds,
    onPredictionChange
}) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    const [loading, setLoading] = useState(false);
    const [predictionResult, setPredictionResult] = useState<AiPredictionResult | null>(null);

    // États pour les habitudes de vie
    const [isSmoking, setIsSmoking] = useState(false);
    const [isAlcoholic, setIsAlcoholic] = useState(false);
    const [isActive, setIsActive] = useState(true); // Par défaut actif

    // Filtrer les mesures actuellement cochées
    const selectedMeasures = recentBiometrics.filter((m) =>
        selectedMeasureIds.includes(m.id)
    );

    // Vérifier la présence de chaque mesure requise
    const hasBloodPressure = selectedMeasures.some((m) =>
        ['BLOOD_PRESSURE', 'BLOOD_PRESSURE_SYSTOLIC', 'BLOOD_PRESSURE_DIASTOLIC'].includes(m.type)
    );
    const hasCholesterol = selectedMeasures.some((m) =>
        ['CHOLESTEROL', 'CHOLESTEROL_TOTAL', 'CHOLESTEROL_HDL', 'CHOLESTEROL_LDL'].includes(m.type)
    );
    const hasGlucose = selectedMeasures.some((m) => m.type === 'BLOOD_GLUCOSE');

    // Détection des doublons
    const countBloodPressure = selectedMeasures.filter((m) =>
        ['BLOOD_PRESSURE', 'BLOOD_PRESSURE_SYSTOLIC', 'BLOOD_PRESSURE_DIASTOLIC'].includes(m.type)
    ).length;
    const countCholesterol = selectedMeasures.filter((m) =>
        ['CHOLESTEROL', 'CHOLESTEROL_TOTAL', 'CHOLESTEROL_HDL', 'CHOLESTEROL_LDL'].includes(m.type)
    ).length;
    const countGlucose = selectedMeasures.filter((m) => m.type === 'BLOOD_GLUCOSE').length;

    const hasDuplicates = countBloodPressure > 1 || countCholesterol > 1 || countGlucose > 1;
    const allRequiredPresent = hasBloodPressure && hasCholesterol && hasGlucose;

    const isButtonEnabled = allRequiredPresent && !hasDuplicates && !loading;

    const handlePredict = async () => {
        if (!isButtonEnabled) return;

        setLoading(true);
        setPredictionResult(null);

        try {
            const res = await fetch(`${apiUrl}/ai/predict`, { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    patientId: patientId,
                    biometricsIds: selectedMeasureIds,
                    isSmoking: isSmoking,
                    isAlcoholic: isAlcoholic,
                    isActive: isActive,
                })
            });

            if (!res.ok) {
                throw new Error(`Erreur lors de la prédiction IA : ${res.statusText}`);
            }

            const data: AiPredictionResult = await res.json();
            setPredictionResult(data);

            if (onPredictionChange) {
                onPredictionChange(data);
            }
        } catch (error) {
            console.error("Erreur prédiction IA :", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.aiCard}>
            <div className={styles.aiHeader}>
                <div className={styles.aiTitle}>
                    <Brain size={20} className={styles.aiIcon} />
                    <h3>Prédiction IA</h3>
                </div>
            </div>

            <p className={styles.description}>
                Pour lancer l'analyse prédictive, vous devez sélectionner exactement <strong>une</strong> valeur pour chacune des données biométriques requises ci-dessous.
            </p>

            {/* Liste de vérification des entrées biométriques */}
            <div className={styles.checkGrid}>
                <div className={`${styles.checkItem} ${hasBloodPressure ? styles.valid : styles.missing}`}>
                    {hasBloodPressure ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                    <span>Tension artérielle</span>
                </div>

                <div className={`${styles.checkItem} ${hasCholesterol ? styles.valid : styles.missing}`}>
                    {hasCholesterol ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                    <span>Cholestérol</span>
                </div>

                <div className={`${styles.checkItem} ${hasGlucose ? styles.valid : styles.missing}`}>
                    {hasGlucose ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                    <span>Glucose (Glycémie)</span>
                </div>
            </div>

            {/* Section des habitudes de vie (Checkboxes) */}
            <div className={styles.lifestyleSection}>
                <span className={styles.lifestyleTitle}>Habitudes de vie du patient :</span>
                <div className={styles.checkboxGroup}>
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={isSmoking}
                            onChange={(e) => setIsSmoking(e.target.checked)}
                        />
                        <Cigarette size={16} />
                        <span>Fumeur</span>
                    </label>

                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={isAlcoholic}
                            onChange={(e) => setIsAlcoholic(e.target.checked)}
                        />
                        <Wine size={16} />
                        <span>Consommateur d'alcool</span>
                    </label>

                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                        />
                        <Activity size={16} />
                        <span>Activité physique régulière</span>
                    </label>
                </div>
            </div>

            {/* Message d'avertissement */}
            {hasDuplicates && (
                <div className={styles.warningBox}>
                    <AlertTriangle size={18} />
                    <span>
                        Attention : Plusieurs mesures du même type sont sélectionnées. Veuillez n'en conserver qu'une seule pour la tension, le cholestérol et le glucose.
                    </span>
                </div>
            )}

            {/* Bouton de déclenchement */}
            <div className={styles.actionRow}>
                <button
                    type="button"
                    className={styles.aiButton}
                    disabled={!isButtonEnabled}
                    onClick={handlePredict}
                >
                    <Sparkles size={18} />
                    {loading ? 'Analyse en cours...' : 'Lancer la prédiction IA'}
                </button>
            </div>

            {/* Affichage du résultat */}
            {predictionResult && (
                <div className={styles.resultBox}>
                    <div className={styles.resultHeader}>
                        <span className={styles.resultTitle}>Risque estimé :</span>
                        <span className={`${styles.riskBadge} ${styles[predictionResult.riskClass.toLowerCase()]}`}>
                            Risque {predictionResult.riskClass === 'High' ? 'Élevé' : predictionResult.riskClass === 'Moderate' ? 'Modéré' : 'Faible'} ({predictionResult.riskScore}%)
                        </span>
                    </div>
                    <p className={styles.resultMessage}>{predictionResult.message}</p>
                </div>
            )}
        </div>
    );
};