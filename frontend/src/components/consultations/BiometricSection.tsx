import styles from './BiometricSection.module.css';
import { Thermometer, Heart, Activity } from 'lucide-react';
import BiometricItem from './BiometricItem';

interface BiometricSectionProps {
    biometrics: {
        temperature?: number;
        heartRate?: number;
        bloodPressure?: string;
    };
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
            </div>
        </div>
    )
}