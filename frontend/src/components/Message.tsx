import { useEffect } from 'react';
import styles from './Message.module.css';
import { Check } from 'lucide-react';

export interface MessageProps {
  isOpen: boolean;
  title?: string;            // Ex: "Rendez-vous confirmé !"
  message: string;
  cancelButton?: boolean;     // Ex: "Votre créneau a bien été réservé."
  buttonText?: string;       // Ex: "D'accord", "Fermer", "Super !"
  buttonColor?: string;      // Optionnel : couleur du bouton
  autoCloseDuration?: number; // Optionnel : fermeture auto après X ms (ex: 5000)
  icon?: React.ReactNode;     // Optionnel : icône personnalisée
  onClose: () => void;
  onAction?: () => void;     // Optionnel : action supplémentaire à exécuter lors du clic sur le bouton
}

export function Message({
  isOpen,
  title = "Opération réussie !",
  message,
  cancelButton = false,
  buttonText = "Compris",
  buttonColor,
  autoCloseDuration,
  icon,
  onClose,
  onAction
}: MessageProps) {

  // Optionnel : Disparition auto si `autoCloseDuration` est fourni
  useEffect(() => {
    if (!isOpen || !autoCloseDuration) return;

    const timer = setTimeout(() => {
      onClose();
    }, autoCloseDuration);

    return () => clearTimeout(timer);
  }, [isOpen, autoCloseDuration, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconWrapper}>
          {icon || <Check size={32} strokeWidth={2.5} />}
        </div>

        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>

        <div className={styles.buttonsContainer}>
          {cancelButton && (
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
            >
              Annuler
            </button>
          )}

          <button
            type="button"
            className={styles.confirmBtn}
            onClick={onAction ? () => { onAction(); } : onClose}
            style={{ backgroundColor: buttonColor }}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}