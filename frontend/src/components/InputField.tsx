import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import styles from './InputField.module.css';

interface InputFieldProps {
    label: string;
    type: 'email' | 'password' | 'text' | 'tel' | 'date' | 'radio' | 'textarea' | 'number';
    value: string | number;
    name?: string;
    subtext?: string;
    required?: boolean;
    disabled?: boolean;
    checked?: boolean;
    rows?: number;
    icon?: React.ReactNode;
    onChange: (nouveauTexte: string) => void;
}

export default function InputField({ label, type, value, name, subtext, required, disabled, checked, rows, icon, onChange }: InputFieldProps) {
    const [showPassword, setShowPassword] = useState(false);

    const isNumberType = type === 'number';
    
    // Si c'hui un number, on utilise type="text" pour shunter la validation native buggée du navigateur,
    // tout en gardant inputMode="decimal" pour avoir le clavier numérique sur mobile.
    const inputType = type === 'password' && showPassword 
        ? 'text' 
        : (isNumberType ? 'text' : type);

    return (
        <div className={styles.field}>
            <label className={styles.label}>
                {label}
            </label>

            <div className={styles.inputWrapper}>
                {icon && <div className={styles.inputIcon}>{icon}</div>}

                {type === 'textarea' ? (
                    <textarea
                        className={`${styles.textarea} ${icon ? styles.hasIcon : ''}`}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        disabled={disabled}
                        required={required}
                        name={name}
                        rows={rows}
                    />
                ) : (
                    <div className={styles.inputContainer}>
                        <input
                            className={`${styles.input} ${icon ? styles.hasIcon : ''}`}
                            type={inputType} // 👈 Réel type HTML injecté
                            inputMode={isNumberType ? 'decimal' : undefined}
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            disabled={disabled}
                            required={required}
                            checked={checked}
                            name={name}
                        />

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
                )}
            </div>

            {subtext && <p className={styles.subtext}>{subtext}</p>}
        </div>
    );
}