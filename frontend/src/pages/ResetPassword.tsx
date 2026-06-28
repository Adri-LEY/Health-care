import React from 'react';
import styles from './ResetPassword.module.css';
import InputField from '../components/InputField';
import SubmitButton from '../components/SubmitButton';


export default function ResetPassword() {
    const [newPassword, setNewPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [passwordResetSuccess, setPasswordResetSuccess] = React.useState(false);
    const [linkExpired, setLinkExpired] = React.useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault(); // Empêche le rechargement de la page
        const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

        try {
            if (newPassword !== confirmPassword) {
                throw new Error('Les mots de passe ne correspondent pas.');
            }

            const response = await fetch(`${apiUrl}/auth/reset-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token: new URLSearchParams(window.location.search).get('token'), newPassword })
            });

            if (!response.ok) {
                if (response.status === 400) {
                    setLinkExpired(true);
                    return;
                }

                const data = await response.json();
                throw new Error(data.message || 'Erreur lors de la réinitialisation du mot de passe');
            }

            setPasswordResetSuccess(true);

            await new Promise(resolve => setTimeout(resolve, 3000));
            window.location.href = '/';

        } catch (error) {
            console.error('Erreur lors de la réinitialisation du mot de passe :', error);
        }


    };

    return (
        <main className={styles.page}>
            <section className={styles.card}>
                {passwordResetSuccess ? (
                    <div>
                        <h2 className={styles.title}>Mot de passe réinitialisé avec succès</h2>
                        <p className={styles.text}>
                            Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
                        </p>
                    </div>
                ) : linkExpired ? (
                    <div>
                        <h2 className={styles.title}>Lien expiré ou invalide</h2>
                        <p className={styles.text}>
                            Le lien de réinitialisation du mot de passe est soit expiré, soit invalide. Veuillez demander un nouveau lien de réinitialisation.
                        </p>
                    </div>
                ) : (
                    <div>
                        <h2 className={styles.title}>Réinitialisation du mot de passe</h2>
                        <p className={styles.text}>
                            Entrez votre nouveau mot de passe ci-dessous. Assurez-vous qu'il respecte les critères de sécurité.
                        </p>

                        <form className={styles.form} onSubmit={handleSubmit}>
                            <InputField
                                label="Nouveau mot de passe"
                                type="password"
                                required={true}
                                value={newPassword}
                                onChange={setNewPassword}
                            />

                            <InputField
                                label="Confirmer le mot de passe"
                                type="password"
                                required={true}
                                value={confirmPassword}
                                onChange={setConfirmPassword}
                            />
                            <SubmitButton>Renouveler le mot de passe</SubmitButton>
                        </form>
                    </div>
                )}
            </section>
        </main>
    );
}