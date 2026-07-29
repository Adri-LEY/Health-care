import { useEffect } from 'react';
import styles from './Message.module.css';

export interface MessageProps {
  isOpen: boolean;
  title?: string;            // Ex: "Rendez-vous confirmé !"
  message: string;           // Ex: "Votre créneau a bien été réservé."
  buttonText?: string;       // Ex: "D'accord", "Fermer", "Super !"
  autoCloseDuration?: number; // Optionnel : fermeture auto après X ms (ex: 5000)
  onClose: () => void;
}

export function Message({
  isOpen,
  title = "Opération réussie !",
  message,
  buttonText = "Compris",
  autoCloseDuration,
  onClose,
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
          ✓
        </div>

        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>

        <button 
          type="button" 
          className={styles.confirmBtn} 
          onClick={onClose}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}