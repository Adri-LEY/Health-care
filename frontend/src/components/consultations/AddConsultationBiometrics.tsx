import { Activity, ChevronDown, ChevronUp, History } from 'lucide-react';
import styles from './AddConsultationBiometrics.module.css';
import BiometricHistory from './BiometricHistory';
import RecentBiometricsList from './RecentBiometricsList';

export interface ConsultationBiometricMeasure {
  id: number;
  type: string;
  value?: number;
  stringValue?: string;
  unit?: string;
  takenAt?: string | null;
  takenBy?: {
    staff?: {
      user?: {
        firstName: string;
        lastName: string;
      } | null;
    } | null;
  } | null;
}

interface AddConsultationBiometricsProps {
  recentBiometrics: ConsultationBiometricMeasure[];
  biometricHistory: ConsultationBiometricMeasure[];
  selectedMeasureIds: number[];
  showHistory: boolean;
  combinedBiometrics: ConsultationBiometricMeasure[];
  onToggleMeasure: (id: number) => void;
  onToggleSelectAll: () => void;
  onToggleHistory: () => void;
}

export default function AddConsultationBiometrics({
  recentBiometrics,
  biometricHistory,
  selectedMeasureIds,
  showHistory,
  combinedBiometrics,
  onToggleMeasure,
  onToggleSelectAll,
  onToggleHistory,
}: AddConsultationBiometricsProps) {
  const allSelected = recentBiometrics.length > 0 && selectedMeasureIds.length === recentBiometrics.length;

  return (
    <section className={styles.biometricsSection}>
      {recentBiometrics.length > 0 && (
        <RecentBiometricsList
          biometrics={recentBiometrics}
          selectedMeasureIds={selectedMeasureIds}
          allSelected={allSelected}
          onToggleMeasure={onToggleMeasure}
          onToggleSelectAll={onToggleSelectAll}
        />
      )}

      <button type="button" className={styles.toggleHistoryBtn} onClick={onToggleHistory}>
        <History size={16} />
        Historique des données biométriques
        {showHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {showHistory && (
        <BiometricHistory
          biometrics={biometricHistory}
          selectedMeasureIds={selectedMeasureIds}
          combinedBiometrics={combinedBiometrics}
          onToggleMeasure={onToggleMeasure}
        />
      )}
    </section>
  );
}

export function DefaultBiometricIcon() {
  return <Activity size={18} />;
}
