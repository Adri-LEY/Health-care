import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react'; // Import des vraies icônes
import styles from './InputField.module.css';

interface InputFieldProps {
    label: string;
    type: 'email' | 'password' | 'text' | 'tel' | 'date' | 'radio'; // On peut ajouter d'autres types si nécessaire
    value: string;
    name?: string; // On peut ajouter un nom facultatif pour le champ
    subtext?: string; // On peut ajouter un texte d'aide facultatif
    required?: boolean; // On peut rendre le champ obligatoire ou non
    disabled?: boolean; // On peut rendre le champ désactivé ou non
    checked?: boolean; // Pour les boutons radio, on peut indiquer s'ils sont cochés ou non
    onChange: (nouveauTexte: string) => void;
}

export default function InputField({ label, type, value, name, subtext, required, disabled, checked, onChange }: InputFieldProps) {
    const [showPassword, setShowPassword] = useState(false);

    // Si c'est un password et qu'on a cliqué sur l'oeil, on change le type en "text"
    const inputType = type === 'password' && showPassword ? 'text' : type;

    return (
        <div className={styles.field}>
            <label className={styles.label}>
                {label}
            </label>
            <div className={styles.inputWrapper}>
                <input
                    className={styles.input}
                    type={inputType}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    required={required}
                    checked={checked} // Pour les boutons radio, on vérifie si la valeur est "true"
                    name={name} // Pour les boutons radio, on met le nom du label
                />

                {/* Si le type initial est 'password', on affiche l'œil AUTOMATIQUEMENT */}
                {type === 'password' && (
                    <button className={styles.eyeButton}
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? (
                            <EyeOff size={18} strokeWidth={2} />
                        ) : (
                            <Eye size={18} strokeWidth={2} />
                        )}
                    </button>
                )}
            </div>

            {subtext && <p className={styles.subtext}>{subtext}</p>}
        </div >
    );
}