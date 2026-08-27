import { AlertCircle } from 'lucide-react';
import styles from './ErrorBox.module.css';

interface ErrorBoxProps {
    messages: string | string[];
}

export function ErrorBox({ messages }: ErrorBoxProps) {
    if (!messages || messages.length === 0) return null;

    return (
        <div className={styles.errorBox}>
            {/* flexShrink: 0 garantit que l'icône garde sa taille même si le texte d'erreur est très long */}
            <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
                <strong style={{ display: 'block', marginBottom: '4px' }}>Une erreur est survenue :</strong>
                {Array.isArray(messages) ? (
                    <ul>
                        {messages.map((msg, index) => (
                            <li key={index}>{msg}</li>
                        ))}
                    </ul>
                ) : (
                    <span>{messages}</span>
                )}
            </div>
        </div>
    );
}