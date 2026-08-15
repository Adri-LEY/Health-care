import styles from './AppointmentModal.module.css';
import { toDateKey, formatTimeUTC } from '../DoctorPlanning/dateUtils';

interface AppointmentModalProps {
    isOpen: boolean;
    date: Date;
    startTime: Date;
    endTime: Date;
    doctorName?: string;
    specialtyName?: string;
    isLoading?: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function AppointmentModal({
    isOpen,
    date,
    startTime,
    endTime,
    doctorName,
    specialtyName,
    isLoading = false,
    onClose,
    onConfirm
}: AppointmentModalProps) {
    if (!isOpen) return null;

    const dateStr = toDateKey(date);

    const startTimeStr = formatTimeUTC(startTime.toISOString());
    const endTimeStr = formatTimeUTC(endTime.toISOString());

    return (
        <div className={styles.overlay} onClick={onClose}>
            {/* e.stopPropagation() évite de fermer la modale si on clique à l'intérieur de la carte */}
            <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
                <h3 className={styles.title}>Confirmer le rendez-vous</h3>

                <p style={{ color: '#475569', margin: 0 }}>
                    Voulez-vous prendre rendez-vous pour la date suivante ?
                </p>

                <div className={styles.detailsContainer}>
                    <p className={styles.dateTimeText}>
                        {dateStr} de {startTimeStr} à {endTimeStr}
                    </p>
                    {doctorName && (
                        <>
                            <div className={styles.doctorName}>
                                avec {doctorName}
                            </div>

                            <div className={styles.specialtyName}>
                                {specialtyName}
                            </div>
                        </>
                    )}
                </div>

                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.cancelBtn}
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Annuler
                    </button>

                    <button
                        type="button"
                        className={styles.confirmBtn}
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className={styles.loadingContent}>
                                <span className={styles.spinner} aria-hidden="true" />
                                Réservation...
                            </span>
                        ) : (
                            'Confirmer'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}