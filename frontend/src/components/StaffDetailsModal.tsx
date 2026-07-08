import type { Dispatch, SetStateAction } from 'react';
import styles from './StaffDetailsModal.module.css';
import type { StaffMember } from './StaffCard';

type SelectOption = {
  id: number;
  name: string;
};

interface StaffDetailsModalProps {
  member: StaffMember;
  specialties: SelectOption[];
  services: SelectOption[];
  pendingSpecialtyId: number | string;
  setPendingSpecialtyId: Dispatch<SetStateAction<number | string>>;
  pendingServiceId: number | string;
  setPendingServiceId: Dispatch<SetStateAction<number | string>>;
  isEditingAssignment: boolean;
  setIsEditingAssignment: Dispatch<SetStateAction<boolean>>;
  isSendingToken: boolean;
  tokenSentSuccess: boolean;
  onClose: () => void;
  onResendActivationToken: (userId: number, email: string) => void;
  onUpdateStaffStatus: (userId: number, newStatus: string) => void;
  onSaveAssignment: () => void;
}

function getRoleLabel(role: string) {
  if (role === 'DOCTOR') return 'Médecin';
  if (role === 'NURSE_ASSISTANT') return 'Aide-soignant';
  return role;
}

function getStatusLabel(status: string) {
  if (status === 'ACTIVE') return 'Actif';
  if (status === 'INACTIVE') return 'Inactif';
  return "En attente d'activation";
}

export default function StaffDetailsModal({
  member,
  specialties,
  services,
  pendingSpecialtyId,
  setPendingSpecialtyId,
  pendingServiceId,
  setPendingServiceId,
  isEditingAssignment,
  setIsEditingAssignment,
  isSendingToken,
  tokenSentSuccess,
  onClose,
  onResendActivationToken,
  onUpdateStaffStatus,
  onSaveAssignment,
}: StaffDetailsModalProps) {
  const { user } = member;
  const isDoctor = user.role === 'DOCTOR';
  const isNurseAssistant = user.role === 'NURSE_ASSISTANT';
  const roleLabel = getRoleLabel(user.role);
  const statusLabel = getStatusLabel(user.userStatus);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(event) => event.stopPropagation()}>
        <h3>Fiche Profil Détaillée</h3>
        <hr />

        <div className={styles.modalBody}>
          <p className={styles.fieldRow}><strong>Nom :</strong> {user.lastName}</p>
          <p className={styles.fieldRow}><strong>Prénom :</strong> {user.firstName}</p>
          <p className={styles.fieldRow}><strong>Rôle :</strong> {roleLabel}</p>

          {isDoctor && (
            <p className={styles.fieldRow}>
              <strong>Spécialité :</strong>
              {isEditingAssignment ? (
                <select
                  className={styles.selectField}
                  value={pendingSpecialtyId}
                  onChange={(event) => setPendingSpecialtyId(event.target.value)}
                >
                  <option value="">-- Choisir une spécialité --</option>
                  {specialties.map((specialty) => (
                    <option key={specialty.id} value={specialty.id}>{specialty.name}</option>
                  ))}
                </select>
              ) : (
                <span> {member.doctor?.specialty?.specialtyName || 'Non renseignée'}</span>
              )}
            </p>
          )}

          {isNurseAssistant && (
            <p className={styles.fieldRow}>
              <strong>Service :</strong>
              {isEditingAssignment ? (
                <select
                  className={styles.selectField}
                  value={pendingServiceId}
                  onChange={(event) => setPendingServiceId(event.target.value)}
                >
                  <option value="">-- Choisir un service --</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>{service.name}</option>
                  ))}
                </select>
              ) : (
                <span> {member.nurseAssistant?.service?.serviceName || 'Non renseigné'}</span>
              )}
            </p>
          )}

          <p className={styles.fieldRow}><strong>Email :</strong> {user.email}</p>
          <p className={styles.fieldRow}><strong>Téléphone :</strong> {user.phone || 'Non renseigné'}</p>
          <p className={styles.fieldRow}><strong>Matricule Interne :</strong> {member.doctor?.registrationId || member.nurseAssistant?.registrationId || 'Aucun'}</p>
          <p className={styles.fieldRow}>
            <strong>Statut du compte :</strong>{' '}
            <span className={user.userStatus === 'ACTIVE' ? styles.statusActive : styles.statusInactive}>
              {statusLabel}
            </span>
          </p>

          <div className={styles.modalActions}>
            {user.userStatus === 'PENDING' && (
              <button
                className={styles.tokenButton}
                onClick={() => onResendActivationToken(user.id, user.email)}
                disabled={isSendingToken || tokenSentSuccess}
                style={{ backgroundColor: tokenSentSuccess ? '#10b981' : undefined }}
                type="button"
              >
                {isSendingToken && 'Envoi en cours...'}
                {tokenSentSuccess && 'Lien envoyé ! ✓'}
                {!isSendingToken && !tokenSentSuccess && "Renvoyer un nouveau lien d'activation"}
              </button>
            )}

            {user.userStatus === 'INACTIVE' && (
              <button
                className={styles.primaryAction}
                onClick={() => onUpdateStaffStatus(user.id, 'ACTIVE')}
                type="button"
              >
                Réactiver le compte
              </button>
            )}

            {user.userStatus === 'ACTIVE' && (
              <button
                className={styles.dangerAction}
                onClick={() => onUpdateStaffStatus(user.id, 'INACTIVE')}
                type="button"
              >
                Désactiver le compte
              </button>
            )}

            {isEditingAssignment ? (
              <button className={styles.successAction} onClick={onSaveAssignment} type="button">
                Enregistrer
              </button>
            ) : (
              <button className={styles.secondaryAction} onClick={() => setIsEditingAssignment(true)} type="button">
                Modifier l'affectation
              </button>
            )}

            <button className={styles.closeButton} onClick={onClose} type="button">
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
