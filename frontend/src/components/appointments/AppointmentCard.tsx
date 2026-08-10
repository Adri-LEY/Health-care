import { Calendar, Clock, Phone, User } from 'lucide-react'; // 👈 Lucide Icons
import styles from './AppointmentCard.module.css';

export interface Appointment {
  id: number;
  dateTime: string;
  status: 'CONFIRMED' | 'SCHEDULED' | 'CANCELLED' | string;
  doctor: {
    staff: {
      user: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
      };
    };
  };
  timeSlot: {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
  };
}

interface AppointmentCardProps {
  appointment: Appointment;
  onCancel?: (id: number) => void;
  onDetails?: (appointment: Appointment) => void;
}

export function AppointmentCard({
  appointment,
  onCancel,
  onDetails,
}: AppointmentCardProps) {
  const { doctor, timeSlot, status } = appointment;
  const doctorUser = doctor?.staff?.user;

  const startDate = new Date(timeSlot?.startTime || appointment.dateTime);
  const endDate = new Date(timeSlot?.endTime);

  const dayNumber = startDate.getDate();
  const monthLabel = startDate.toLocaleDateString('fr-FR', { month: 'short' });
  
  const startTimeStr = startDate.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  });
  
  const endTimeStr = endDate.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return styles.statusConfirmed;
      case 'SCHEDULED': return styles.statusScheduled;
      case 'CANCELLED': return styles.statusCancelled;
      case 'MISSED': return styles.statusMissed;
      default: return styles.statusDefault;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'Confirmé';
      case 'SCHEDULED': return 'Planifié';
      case 'CANCELLED': return 'Annulé';
      case 'MISSED': return 'Manqué';
      default: return status;
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.mainInfo}>
        {/* Badge Date */}
        <div className={styles.dateBadge}>
          <span className={styles.dayNumber}>{dayNumber}</span>
          <span className={styles.monthLabel}>{monthLabel}</span>
        </div>

        {/* Info Médecin & Horaire */}
        <div className={styles.details}>
          <h4 className={styles.doctorName}>
            Dr. {doctorUser?.firstName} {doctorUser?.lastName}
          </h4>
          
          <div className={styles.infoRow}>
            <Clock size={16} className={styles.icon} />
            <span>{startTimeStr} - {endTimeStr}</span>
          </div>

          {doctorUser?.phone && (
            <div className={styles.infoRow}>
              <Phone size={16} className={styles.icon} />
              <span>{doctorUser.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Statut & Actions */}
      <div className={styles.statusContainer}>
        <span className={`${styles.statusBadge} ${getStatusBadgeClass(status)}`}>
          {getStatusText(status)}
        </span>

        <div className={styles.actions}>
          {onDetails && (
            <button
              type="button"
              className={styles.actionBtn}
              onClick={() => onDetails(appointment)}
            >
              Détails
            </button>
          )}

          {onCancel && status !== 'CANCELLED' && (
            <button
              type="button"
              className={`${styles.actionBtn} ${styles.cancelBtn}`}
              onClick={() => onCancel(appointment.id)}
            >
              Annuler
            </button>
          )}
        </div>
      </div>
    </div>
  );
}