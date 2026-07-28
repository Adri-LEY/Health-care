import styles from './StaffCard.module.css';

export type StaffMember = {
    user: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        createdAt: string;
        updatedAt: string;
        role: string;
        userStatus?: string;
    };
    doctor?: {
        id?: number;
        registrationId: string;
        specialty?: {
            id: number;
            specialtyName: string;
        };
    };
    nurseAssistant?: {
        registrationId: string;
        service?: {
            id: number;
            serviceName: string;
        };
    };
};

export interface StaffCardProps {
    member: StaffMember;
    onSelect?: (member: StaffMember) => void;
}

export default function StaffCard({ member, onSelect }: StaffCardProps) {
    const { user, doctor, nurseAssistant} = member;
    const specialtyOrService =
        user.role === 'DOCTOR'
            ? doctor?.specialty?.specialtyName
            : user.role === 'NURSE_ASSISTANT'
              ? nurseAssistant?.service?.serviceName
              : undefined;

    return (
        <button className={styles['staff-row']} onClick={() => onSelect?.(member)}>
            <span className={styles['staff-name']}>
                {user.firstName} {user.lastName}
            </span>

            <span className={styles['staff-role']}>
                {user.role === 'DOCTOR' ? 'Médecin' : user.role === 'NURSE_ASSISTANT' ? 'Aide-soignant' : user.role}
            </span>

            <span className={styles['staff-contact']}>
                {user.email}
                <br />
                {user.phone || 'Non renseigné'}
            </span>

            <span className={styles['staff-extra']}>
                {specialtyOrService || 'Aucune information complémentaire'}
            </span>

            {user.userStatus && user.userStatus === 'ACTIVE' && (
                <span className={styles['staff-status-active']}>
                    Actif
                </span>
            )}

            {user.userStatus && user.userStatus === 'INACTIVE' && (
                <span className={styles['staff-status-inactive']}>
                    Inactif
                </span>
            )}
        </button>
    );
}
