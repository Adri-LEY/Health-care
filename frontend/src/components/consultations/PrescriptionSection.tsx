import styles from './PrescriptionSection.module.css';
import { Pill, CheckCircle } from 'lucide-react';

interface PrescriptionItem {
    id: number;
    name: string;
    description: string;
    dosage: string;
    duration: string;
    careId?: number | null;
}


export default function PrescriptionSection({ prescription }: { prescription: PrescriptionItem[] }) {

    return (
        <div className={styles.detailSection}>
            <h3 className={styles.subSectionTitle}>
                <Pill size={18} className={styles.sectionIconGreen} />
                Ordonnance prescrite
            </h3>
            {prescription && prescription.length > 0 ? (
                <div className={styles.prescriptionGrid}>
                    {prescription.map((item) => (
                        <div key={item.id} className={styles.prescriptionItemCard}>
                            <div className={styles.prescriptionHeader}>
                                <span className={styles.medicationName}>{item.name}</span>
                                <span className={styles.durationBadge}>{item.duration}</span>
                            </div>
                            <p className={styles.medicationDesc}>{item.description}</p>
                            <div className={styles.dosageBox}>
                                <strong>Posologie :</strong> {item.dosage}
                            </div>
                            {item.careId && (
                                <div className={styles.careBadge}>
                                    <CheckCircle size={12} /> Soin d'accompagnement paramédical requis
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className={styles.emptyPrescription}>
                    <p>Aucun traitement prescrit lors de cette consultation.</p>
                </div>
            )}
        </div>
    )
}