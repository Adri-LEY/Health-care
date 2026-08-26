import { CalendarCheck, CheckCircle2, Clock3, ListChecks, Stethoscope, Calendar, Clock, Phone } from 'lucide-react';
import styles from './PatientAppointmentDashboard.module.css';

export interface PatientAppointmentStats {
  totalAppointments: number;
  completedAppointments: number;
  upcomingAppointments: number;
  cancelledAppointments: number;
  missedAppointments: number;
  appointmentsBySpecialty: Array<{
    specialtyName: string;
    totalAppointments: number;
    completedAppointments: number;
  }>;
}

interface PatientAppointmentDashboardProps {
  stats: PatientAppointmentStats;
  nextAppointment?: any | null;
  onCancelNextAppointment?: (id: number) => void;
}

export function PatientAppointmentDashboard({ 
  stats, 
  nextAppointment, 
  onCancelNextAppointment 
}: PatientAppointmentDashboardProps) {
  return (
    <section className={styles.dashboard} aria-labelledby="appointment-dashboard-title">
      <div className={styles.dashboardHeader}>
        <div>
          <p className={styles.eyebrow}>Votre suivi</p>
          <h2 id="appointment-dashboard-title">Résumé des rendez-vous</h2>
        </div>
        <CalendarCheck size={24} aria-hidden="true" />
      </div>

      <div className={styles.metrics}>
        <div className={styles.metric}>
          <ListChecks size={20} />
          <strong>{stats.totalAppointments}</strong>
          <span>Total des rendez-vous</span>
        </div>
        <div className={styles.metric}>
          <CheckCircle2 size={20} />
          <strong>{stats.completedAppointments}</strong>
          <span>Rendez-vous réalisés</span>
        </div>
        <div className={styles.metric}>
          <Clock3 size={20} />
          <strong>{stats.upcomingAppointments}</strong>
          <span>À venir</span>
        </div>
        <div className={styles.metric}>
          <Stethoscope size={20} />
          <strong>{stats.missedAppointments}</strong>
          <span>Rendez-vous manqués</span>
        </div>
      </div>

      {/* 🌟 PROCHAIN RDV MIS EN ÉVIDENCE DANS LE DASHBOARD */}
      {nextAppointment && (
        <div className={styles.heroSection}>
          <h3 className={styles.heroTitle}>
            <Calendar size={18} color="#2563eb" /> Prochain rendez-vous
          </h3>

          <div className={styles.heroCard}>
            <span className={styles.heroBadge}>Le plus proche</span>

            <div className={styles.heroContent}>
              <div className={styles.heroMain}>
                {/* Badge Date */}
                <div className={styles.heroDateBadge}>
                  <span className={styles.heroDay}>
                    {new Date(nextAppointment.timeSlot.startTime).getDate()}
                  </span>
                  <span className={styles.heroMonth}>
                    {new Date(nextAppointment.timeSlot.startTime).toLocaleDateString('fr-FR', { month: 'short' })}
                  </span>
                </div>

                {/* Infos docteur & heure */}
                <div className={styles.heroDetails}>
                  <span className={styles.heroEyebrow}>Consultation à venir</span>
                  <h4 className={styles.heroDoctor}>
                    Dr. {nextAppointment.doctor?.staff?.user?.firstName} {nextAppointment.doctor?.staff?.user?.lastName}
                  </h4>

                  {nextAppointment.doctor?.specialty?.specialtyName && (
                    <span className={styles.heroSpecialty}>
                      {nextAppointment.doctor.specialty.specialtyName}
                    </span>
                  )}

                  <div className={styles.heroInfoRow}>
                    <Clock size={16} color="#2563eb" />
                    <span>
                      {new Date(nextAppointment.timeSlot.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
                      {' - '}
                      {new Date(nextAppointment.timeSlot.endTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
                    </span>
                  </div>

                  {nextAppointment.doctor?.staff?.user?.phone && (
                    <div className={styles.heroInfoRow}>
                      <Phone size={16} color="#64748b" />
                      <span>{nextAppointment.doctor.staff.user.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bouton Annuler */}
              {onCancelNextAppointment && (
                <div className={styles.heroActions}>
                  <button
                    type="button"
                    className={styles.cancelHeroBtn}
                    onClick={() => onCancelNextAppointment(nextAppointment.id)}
                  >
                    Annuler ce RDV
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </section>
  );
}