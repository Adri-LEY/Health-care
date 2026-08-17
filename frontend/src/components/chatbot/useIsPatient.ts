import { useEffect, useState } from 'react';

interface User {
    role: string;
    id: number;
}

export const useIsPatient = (): boolean => {
    const [isPatient, setIsPatient] = useState(false);

    useEffect(() => {
        const userString = localStorage.getItem('user');
        if (userString) {
            try {
                const user: User = JSON.parse(userString);
                setIsPatient(user.role === 'PATIENT');
            } catch {
                setIsPatient(false);
            }
        }
    }, []);

    return isPatient;
};
