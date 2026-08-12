import styles from './BiometricSection.module.css';
import { 
    Thermometer, 
    Heart, 
    Activity, 
    Scale, 
    Ruler, 
    Percent, 
    Droplet 
} from 'lucide-react';
import BiometricItem from './BiometricItem';

// Interface couvrant toutes les mesures biométriques courantes
export interface BiometricData {
    temperature?: number;
    heartRate?: number;
    bloodPressure?: string;
    weight?: number;
    height?: number;
    oxygenSaturation?: number;
    bloodGlucose?: number;
    cholesterol?: number;
}

interface BiometricSectionProps {
    biometrics: BiometricData;
}

export default function BiometricSection({ biometrics }: BiometricSectionProps) {
    return (
        <div className={styles.detailSection}>
            <h3 className={styles.subSectionTitle}>
                <Activity size={18} className={styles.sectionIconRed} />
                Constantes vitales relevées
            </h3>
            <div className={styles.biometricsGrid}>
                {biometrics.temperature && (
                    <BiometricItem
                        label="Température"
                        value={biometrics.temperature}
                        unit="°C"
                        icon={<Thermometer className={styles.biometricIconTemp} size={20} />}
                    />
                )}
                {biometrics.heartRate && (
                    <BiometricItem
                        label="Fréquence Cardiaque"
                        value={biometrics.heartRate}
                        unit="bpm"
                        icon={<Heart className={styles.biometricIconHeart} size={20} />}
                    />
                )}
                {biometrics.bloodPressure && (
                    <BiometricItem
                        label="Tension Artérielle"
                        value={biometrics.bloodPressure}
                        unit="mmHg"
                        icon={<Activity className={styles.biometricIconPressure} size={20} />}
                    />
                )}
                {biometrics.weight && (
                    <BiometricItem
                        label="Poids"
                        value={biometrics.weight}
                        unit="kg"
                        icon={<Scale className={styles.biometricIconWeight} size={20} />}
                    />
                )}
                {biometrics.height && (
                    <BiometricItem
                        label="Taille"
                        value={biometrics.height}
                        unit="cm"
                        icon={<Ruler className={styles.biometricIconHeight} size={20} />}
                    />
                )}
                {biometrics.oxygenSaturation && (
                    <BiometricItem
                        label="Saturation O₂"
                        value={biometrics.oxygenSaturation}
                        unit="%"
                        icon={<Percent className={styles.biometricIconOxygen} size={20} />}
                    />
                )}
                {biometrics.bloodGlucose && (
                    <BiometricItem
                        label="Glycémie"
                        value={biometrics.bloodGlucose}
                        unit="g/L"
                        icon={<Droplet className={styles.biometricIconGlucose} size={20} />}
                    />
                )}
                {biometrics.cholesterol && (
                    <BiometricItem
                        label="Cholestérol"
                        value={biometrics.cholesterol}
                        unit="mg/dL"
                        icon={<Activity className={styles.biometricIconCholesterol} size={20} />}
                    />
                )}

            </div>
        </div>
    );
}