import styles from './ObservationSection.module.css';
import { FileText } from 'lucide-react';

export default function ObservationSection({ observations }: { observations: string }) {

    return (
        <div className={styles.detailSection}>
            <h3 className={styles.subSectionTitle}>
                <FileText size={18} className={styles.sectionIconBlue} />
                Observations du praticien
            </h3>
            <div className={styles.textAreaBox}>
                <p className={styles.observationsText}>{observations || "Aucune observation rédigée."}</p>
            </div>
        </div>
    )
}