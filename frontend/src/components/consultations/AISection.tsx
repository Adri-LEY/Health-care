import styles from './AISection.module.css';
import { Brain } from 'lucide-react';

interface AIAnalysisProps {
    aiAnalysis: {
        id: number;
        riskScore: number;
        riskClass: 'Low' | 'Moderate' | 'High' | string;
        message: string,
    };
}

export default function AISection({ aiAnalysis }    : AIAnalysisProps) {

    const getRiskBadgeClass = (riskClass: string) => {
        switch (riskClass) {
            case 'High': return styles.badgeHigh;
            case 'Moderate': return styles.badgeModerate;
            default: return styles.badgeLow;
        }
    };

    return (
        <div className={`${styles.detailSection} ${styles.aiSection}`}>
            <div className={styles.aiHeader}>
                <h3 className={styles.subSectionTitle}>
                    <Brain size={20} className={styles.sectionIconPurple} />
                    Analyse prédictive de risque IA
                </h3>
                <span className={`${styles.riskBadge} ${getRiskBadgeClass(aiAnalysis.riskClass)}`}>
                    Risque {aiAnalysis.riskClass === 'High' ? 'Élevé' : aiAnalysis.riskClass === 'Moderate' ? 'Modéré' : 'Faible'} ({aiAnalysis.riskScore}%)
                </span>
            </div>
            <div className={styles.aiMessageBox}>
                <p className={styles.aiMessage}>{aiAnalysis.message}</p>
            </div>
        </div>
    )
}