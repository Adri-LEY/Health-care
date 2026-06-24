import React from 'react';
import InputField from '../components/InputField';
import Button from '../components/Button';
import styles from './Login.module.css';

export default function Login() {
  const [identifier, setIdentifier] = React.useState('');
  const [password, setPassword] = React.useState('');

  const [error, setError] = React.useState('');


    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault(); // Annule l'envoi HTTP synchrone natif (qui rechargerait la page)

      const normalizedIdentifier = identifier.trim();
      const payload = normalizedIdentifier.includes('@')
        ? { email: normalizedIdentifier.toLowerCase(), password }
        : { phone: normalizedIdentifier, password };

        try {
            const response = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
          body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'Identifiants incorrects');

            // --- CAS DE SUCCÈS ---
            console.log('Connexion réussie ! Données reçues :', data);
            
            localStorage.setItem('token', data.accessToken);

            window.location.href = '/dashboard';
            
        } catch (err: any) {
            // --- CAS D'ÉCHEC ---
            setError(err.message);
        }
    };

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1 className={styles.title}>
          HealthManager
        </h1>

        <h2 className={styles.subtitle}>
          Se connecter
        </h2>
        
        <form className={styles.form} onSubmit={handleSubmit}>
          <InputField
            label="Email ou téléphone"
            type="text"
            value={identifier}
            required={true}
            onChange={setIdentifier}
          />

          <InputField
            label="Mot de passe"
            type="password"
            value={password}
            subtext="Au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial (!@#$%^&*)."
            required={true}
            onChange={setPassword}
          />

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <Button>Se connecter</Button>
        </form>
      </section>
    </main>
  );
}