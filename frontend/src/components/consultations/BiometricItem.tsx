import styles from './BiometricSection.module.css';
import { Thermometer, Heart, Activity } from 'lucide-react';

interface BiometricItemProps {
    label: string;
    value: number | string;
    unit: string;
    icon: React.ReactNode;
}

export default function BiometricItem({ label, value, unit, icon }: BiometricItemProps) {

    return (
        <div className={styles.biometricItem}>
            {icon}
            <div className={styles.biometricInfo}>
                <span className={styles.biometricLabel}>{label} : </span>
                <span className={styles.biometricValue}>{value} {unit}</span>
            </div>
        </div>
    )
}