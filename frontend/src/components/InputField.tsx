import styles from './InputField.module.css';

// On définit la liste des propriétés que notre brique peut recevoir
interface InputFieldProps {
  label: string;
  type: 'email' | 'password' | 'text' | 'tel'; // On limite le type aux options utiles ici
  value: string;
  subtext?: string; // On peut ajouter un texte d'aide facultatif
  required?: boolean; // On peut rendre le champ obligatoire ou non
  onChange: (nouveauTexte: string) => void;
}

export default function InputField({ label, type, value, subtext, required, onChange }: InputFieldProps) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>
        {label}
      </label>
      <input
        className={styles.input}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
      {subtext && <p className={styles.subtext}>{subtext}</p>}
    </div>
  );
}