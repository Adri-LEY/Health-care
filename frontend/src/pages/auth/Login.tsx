import React from 'react';
import InputField from '../../components/InputField';
import SubmitButton from '../../components/SubmitButton';
import styles from './Login.module.css';
import {useNavigate} from 'react-router-dom';

export default function Login() {
  const [identifier, setIdentifier] = React.useState('');
  const [password, setPassword] = React.useState('');

  const [error, setError] = React.useState('');

  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL;


    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault(); // Annule l'envoi HTTP synchrone natif (qui rechargerait la page)

      const normalizedIdentifier = identifier.trim();
      const payload = normalizedIdentifier.includes('@')
        ? { email: normalizedIdentifier.toLowerCase(), password }
        : { phone: normalizedIdentifier, password };

        try {
          const response = await fetch(`${apiUrl}/auth/login`, {
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
            localStorage.setItem('user', JSON.stringify(data.user));

            navigate('/');
            
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
            required={true}
            onChange={setPassword}
          />

          <a href="/forgot-password" className={styles.forgotPasswordLink}>
            Mot de passe oublié ?
          </a>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <a href="/signup" className={styles.signupLink}>
            Pas encore de compte ? Créez-en un
          </a>

          <SubmitButton>Se connecter</SubmitButton>
        </form>
      </section>
    </main>
  );
}