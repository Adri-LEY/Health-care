import {
  Activity,
  Droplet,
  Heart,
  Percent,
  Ruler,
  Scale,
  Thermometer,
} from 'lucide-react';
import { MetricCard } from '../MetricCard';
import styles from './AddConsultationBiometrics.module.css';
import type { ConsultationBiometricMeasure } from './AddConsultationBiometrics';

const MEASURE_CONFIG: Record<string, { label: string; icon: React.ReactNode }> = {
  TEMPERATURE: { label: 'Température', icon: <Thermometer size={18} color="#f97316" /> },
  HEART_RATE: { label: 'Fréquence cardiaque', icon: <Heart size={18} color="#ef4444" /> },
  BLOOD_PRESSURE: { label: 'Tension artérielle', icon: <Activity size={18} color="#3b82f6" /> },
  WEIGHT: { label: 'Poids', icon: <Scale size={18} color="#8b5cf6" /> },
  HEIGHT: { label: 'Taille', icon: <Ruler size={18} color="#10b981" /> },
  OXYGEN_SATURATION: { label: 'SpO2', icon: <Percent size={18} color="#06b6d4" /> },
  BLOOD_GLUCOSE: { label: 'Glycémie', icon: <Droplet size={18} color="#eab308" /> },
  CHOLESTEROL: { label: 'Cholestérol', icon: <Activity size={18} color="#a855f7" /> },
};

interface RecentBiometricsListProps {
  biometrics: ConsultationBiometricMeasure[];
  selectedMeasureIds: number[];
  allSelected: boolean;
  onToggleMeasure: (id: number) => void;
  onToggleSelectAll: () => void;
}

export default function RecentBiometricsList({
  biometrics,
  selectedMeasureIds,
  allSelected,
  onToggleMeasure,
  onToggleSelectAll,
}: RecentBiometricsListProps) {
  return (
    <>
      <div className={styles.biometricsHeader}>
        <span className={styles.biometricsTitle}>
          <Activity size={18} />
          Constantes récentes saisies (Tri)
        </span>
        <label className={styles.selectAllLabel}>
          <input type="checkbox" className={styles.checkboxInput} checked={allSelected} onChange={onToggleSelectAll} />
          Tout cocher
        </label>
      </div>

      <div className={styles.biometricsGrid}>
        {biometrics.map((measure) => {
          const isChecked = selectedMeasureIds.includes(measure.id);
          const config = MEASURE_CONFIG[measure.type] || { label: measure.type, icon: <Activity size={18} /> };

          return (
            <label
              key={measure.id}
              className={`${styles.selectableWrapper} ${isChecked ? styles.selected : ''}`}
            >
              <input
                type="checkbox"
                className={styles.checkboxInput}
                checked={isChecked}
                onChange={() => onToggleMeasure(measure.id)}
              />
              <MetricCard
                icon={config.icon}
                label={config.label}
                value={measure.value ?? measure.stringValue ?? 'N/A'}
                unit={measure.unit ?? undefined}
                className={styles.customMetricCard}
              />
            </label>
          );
        })}
      </div>
    </>
  );
}

export { MEASURE_CONFIG };
