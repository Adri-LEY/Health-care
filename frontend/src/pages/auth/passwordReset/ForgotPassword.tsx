import React from 'react';
import { useNavigate } from 'react-router-dom';
import InputField from '../../../components/InputField';
import SubmitButton from '../../../components/SubmitButton';
import styles from './ForgotPassword.module.css';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = React.useState('');
    const [emailSent, setEmailSent] = React.useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        setEmailSent(true);

        event.preventDefault(); // Annule l'envoi HTTP synchrone natif (qui rechargerait la page)
        const apiUrl = import.meta.env.VITE_API_URL;

        try {
            const response = await fetch(`${apiUrl}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });
            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'Erreur lors de la demande de réinitialisation');
        } catch (error) {
            console.error('Erreur lors de la demande de réinitialisation :', error);
        }
    };

    return (
        <main className={styles.page}>
            <section className={styles.card}>
                <button type="button" onClick={() => navigate(-1)} className={styles.backButton}>
                    <ArrowLeft size={18} aria-hidden="true" />
                    <span>Retour</span>
                </button>

                {emailSent ? (
                    <div>
                        <h2 className={styles.title}>Lien de réinitialisation envoyé</h2>
                        <p className={styles.text}>
                            Si l'adresse e-mail que vous avez saisie est associée à un compte, vous recevrez un e-mail avec un lien pour réinitialiser votre mot de passe.
                        </p>
                    </div>
                ) : (
                    <div>
                        <h2 className={styles.title}>Mot de passe oublié</h2>
                        <p className={styles.text}>
                            Entrez votre adresse e-mail pour recevoir un lien de réinitialisation de mot de passe.
                        </p>

                        <form className={styles.form} onSubmit={handleSubmit}>
                            <InputField
                                label="Email"
                                type="email"
                                value={email}
                                required={true}
                                onChange={setEmail}
                            />
                            <SubmitButton>Envoyer le lien de réinitialisation</SubmitButton>


                        </form>
                    </div>
                )}
            </section>
        </main>
    );
}