import styles from './AssignDoctorButton.module.css';
import { UserCheck, UserX } from 'lucide-react';

interface AssignDoctorButtonProps {
    isDoctor?: boolean;
    currentDoctorId?: number | null;
    doctorId?: number | null;
    onAssign?: (assign: boolean) => Promise<void>;
}


export default function AssignDoctorButton({ isDoctor, currentDoctorId, doctorId, onAssign }: AssignDoctorButtonProps) {
    console.log("doctorId:", doctorId); 
    // Déterminer si le médecin connecté est le médecin traitant actuel de ce patient
    const isCurrentDoctorAssigned = doctorId === currentDoctorId;

    // Déterminer si un autre médecin est déjà assigné
    const hasAnotherDoctor = doctorId && doctorId !== currentDoctorId;

    return (

        <div className={styles['assign-doctor-button-container']}>
            {isDoctor && onAssign && (
                <div className={styles.actionContainer} style={{ marginTop: '15px' }}>
                    {isCurrentDoctorAssigned ? (
                        // Cas A : Je suis le médecin affecté -> Je peux me retirer
                        <button
                            onClick={() => onAssign(false)}
                            className={styles.btnRemove}
                        >
                            <UserX size={16} /> Se retirer du patient
                        </button>
                    ) : (
                        // Cas B & C : Le patient n'a pas de médecin, ou en a un autre
                        <button
                            onClick={() => onAssign(true)}
                            disabled={!!hasAnotherDoctor} // Bloqué si un autre médecin est déjà affecté
                            className={styles.btnAssign}
                        >
                            <UserCheck size={16} />
                            {hasAnotherDoctor
                                ? "Prise en charge verrouillée"
                                : "S'assigner comme médecin"
                            }
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}
