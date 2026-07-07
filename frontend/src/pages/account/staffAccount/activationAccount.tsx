import { useState } from "react";
import { useLocation } from "react-router-dom";
import InputField from "../../../components/InputField";
import SubmitButton from "../../../components/SubmitButton";
import styles from "./activationAccount.module.css";


export function ActivationAccount() {
    const [activationStatus, setActivationStatus] = useState<string | null>(null);
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    
    const queryParams = new URLSearchParams(window.location.search);
    const activationToken = queryParams.get('token');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setActivationStatus("error");
            setErrorMessage("Les mots de passe ne correspondent pas.");
            return;
        }

        try {
            console.log("Activation token:", activationToken);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/staff/activateStaffMember`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ activationToken, password }),
            });

            console.log("Activation response:", response);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Erreur lors de l'activation du compte.");
            }

            setActivationStatus("success");

            setTimeout(() => {
                window.location.href = '/login';
            }, 3000); // Redirection après 3 secondes
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Une erreur inconnue est survenue.");
            setActivationStatus("error");
        }
    };

    return (
        <div className={styles.activationContainer}>
            {activationStatus === "success" && <p className={styles.successMessage}>Votre compte a été activé avec succès ! Vous pouvez maintenant vous connecter.</p>}

            {activationStatus !== "success" && (
                <div className={styles.activationForm}>
                    <h1>Activation de votre compte</h1>
                    <h2>Veuillez renseigner votre mot de passe pour activer votre compte.</h2>

                    <form onSubmit={handleSubmit}>

                        <InputField
                            label="Mot de passe"
                            type="password"
                            value={password}
                            required={true}
                            onChange={setPassword}
                        />
                        <InputField
                            label="Confirmer le mot de passe"
                            type="password"
                            value={confirmPassword}
                            required={true}
                            onChange={setConfirmPassword}
                        />

                        {activationStatus === "error" && <p className={styles.errorMessage}>{errorMessage}</p>}

                        <SubmitButton>Activer mon compte</SubmitButton>
                    </form>
                </div>

            )}
        </div>
    );
}