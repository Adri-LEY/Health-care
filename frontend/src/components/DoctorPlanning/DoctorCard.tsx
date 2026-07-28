import styles from './DoctorCard.module.css';

export interface DoctorProfileData {
  id: number;
  specialty?: {
    specialtyName: string;
  };
  staff?: {
    id: number;
    user: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      role: string;
    };
  };
}

interface DoctorCardProps {
  doctor: DoctorProfileData | null;
}

export function DoctorCard({ doctor }: DoctorCardProps) {
  if (!doctor) {
    return <div className={styles.cardLoading}>Chargement du profil...</div>;
  }

  const user = doctor.staff?.user;
  const fullName = user ? `Dr ${user.firstName} ${user.lastName}` : 'Médecin';
  const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : 'DR';

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.avatar}>{initials}</div>
        <div className={styles.identity}>
          <h1 className={styles.name}>{fullName}</h1>
          {doctor.specialty?.specialtyName && (
            <p className={styles.specialty}>{doctor.specialty.specialtyName}</p>
          )}
        </div>
      </div>

      <hr className={styles.divider} />

      <div className={styles.infoGroup}>
        <h3>Coordonnées</h3>
        {user?.phone && (
          <div className={styles.infoItem}>
            <span className={styles.icon}>📞</span>
            <span>{user.phone}</span>
          </div>
        )}
        {user?.email && (
          <div className={styles.infoItem}>
            <span className={styles.icon}>✉️</span>
            <span>{user.email}</span>
          </div>
        )}
      </div>
    </div>
  );
}