import { Activity } from 'lucide-react';
import styles from './AddConsultationBiometrics.module.css';
import type { ConsultationBiometricMeasure } from './AddConsultationBiometrics';
import { MEASURE_CONFIG } from './RecentBiometricsList';

interface BiometricHistoryProps {
  biometrics: ConsultationBiometricMeasure[];
  selectedMeasureIds: number[];
  combinedBiometrics: ConsultationBiometricMeasure[];
  onToggleMeasure: (id: number) => void;
}

export default function BiometricHistory({
  biometrics,
  selectedMeasureIds,
  combinedBiometrics,
  onToggleMeasure,
}: BiometricHistoryProps) {
  if (biometrics.length === 0) {
    return <div className={styles.emptyHistory}>Aucun historique disponible.</div>;
  }

  const groups = biometrics.reduce<Record<string, { date: string; author: string | null; items: ConsultationBiometricMeasure[] }>>(
    (accumulator, item) => {
      const groupKey = item.takenAt || 'Sans date';
      if (!accumulator[groupKey]) {
        const takenByStaff = item.takenBy?.staff?.user;
        accumulator[groupKey] = {
          date: item.takenAt
            ? new Date(item.takenAt).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Date inconnue',
          author: takenByStaff ? `${takenByStaff.firstName} ${takenByStaff.lastName}` : null,
          items: [],
        };
      }
      accumulator[groupKey].items.push(item);
      return accumulator;
    },
    {},
  );

  return (
    <div className={styles.biometricsScrollContainer}>
      <div className={styles.historyGroupList}>
        {Object.entries(groups).map(([groupKey, group]) => (
          <div key={groupKey} className={styles.historyGroupCard}>
            <div className={styles.historyGroupHeader}>
              <span className={styles.historyGroupDate}>Date : {group.date}</span>
              {group.author && <span className={styles.historyGroupAuthor}>Saisi par : {group.author}</span>}
            </div>
            <div className={styles.historyGroupItems}>
              {group.items.map((item) => {
                const isChecked = selectedMeasureIds.includes(item.id);
                const config = MEASURE_CONFIG[item.type] || { label: item.type, icon: <Activity size={16} /> };
                const measure = combinedBiometrics.find((candidate) => candidate.id === item.id) ?? item;

                return (
                  <label
                    key={measure.id}
                    className={`${styles.historySelectableWrapper} ${isChecked ? styles.selectedHistory : ''}`}
                  >
                    <input
                      type="checkbox"
                      className={styles.checkboxInput}
                      checked={isChecked}
                      onChange={() => onToggleMeasure(measure.id)}
                    />
                    <span className={styles.historyItemLabel}>
                      {config.icon}
                      {config.label}
                    </span>
                    <span className={styles.historyItemValue}>
                      {measure.value ?? measure.stringValue ?? 'N/A'} {measure.unit || ''}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
