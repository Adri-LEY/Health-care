import styles from './ConsultationHistory.module.css';
import { Calendar } from 'lucide-react';

interface ConsultationHistoryProps {
    loadingHistory: boolean;
    history: {
        id: number;
        date: string;
        visitReason: string;
    }[];
    selectedConsultationId: number | null;
    setSelectedConsultationId: (id: number) => void;
}

export default function ConsultationHistory({ loadingHistory, history, selectedConsultationId, setSelectedConsultationId }: ConsultationHistoryProps) {

    // Formatage des dates
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <div className={styles.historyColumn}>
            <div className={styles.historySidebar}>
                <h2 className={styles.sectionTitle}>Visites médicales</h2>
                {loadingHistory ? (
                    <div className={styles.spinnerContainer}>Chargement de l'historique...</div>
                ) : (
                    <div className={styles.consultationList}>
                        {history.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setSelectedConsultationId(item.id)}
                                className={`${styles.consultationCard} ${selectedConsultationId === item.id ? styles.activeCard : ''}`}
                            >
                                <div className={styles.cardHeader}>
                                    <Calendar size={16} className={styles.calendarIcon} />
                                    <span className={styles.consultationDate}>{formatDate(item.date)}</span>
                                </div>
                                <p className={styles.consultationReason}>{item.visitReason}</p>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}