import React from 'react';
import { Calendar, Clock, CheckCircle2 } from 'lucide-react';
import styles from './TodayAppointmentsSection.module.css';

const TodayAppointmentsSection = ({ data }: { data: any }) => {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>
          <Calendar size={20} color="#4f46e5" />
          Rendez-vous du jour ({data.todayCount})
        </h2>
      </div>

      <div className={styles.scrollableList}>
        {data.todaySchedule.map((apt: any) => {
          const time = new Date(apt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return (
            <div key={apt.id} className={styles.appointmentItem}>
              <div className={styles.timeBadge}>
                <Clock size={16} color="#94a3b8" />
                <span>{time}</span>
              </div>
              <span className={styles.patientDetail}>Patient #{apt.patientId}</span>
              <span className={styles.statusBadge}>
                <CheckCircle2 size={12} />
                {apt.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TodayAppointmentsSection;