import { useEffect, useState } from 'react';
import { type TimeSlotProps } from '../../components/DoctorPlanning/dateUtils';
import { useParams } from 'react-router-dom';
import { DoctorAvailabilities } from '../../components/DoctorPlanning/DoctorAvailabilities';
import styles from './doctorProfile.module.css';

export function DoctorProfile() {
    const doctorId = useParams<{ doctorId: string }>().doctorId;
    const [slots, setSlots] = useState<TimeSlotProps[]>([]);
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    const getDoctorAvailabilities = async (doctorId: number, dateQuery?: string) => {
        try {
            const response = await fetch(`${apiUrl}/appointments/doctor/${doctorId}/availabilities${dateQuery ? `?date=${dateQuery}` : ''}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Doctor availabilities fetched:', data);
            setSlots(data.timeSlots);
        }
        catch (error) {
            console.error('Error fetching doctor availabilities:', error);
        }
    };

    useEffect(() => {
        getDoctorAvailabilities(doctorId ? parseInt(doctorId) : 0);
    }, [doctorId]);

    return (
        /* Style inline ou classes CSS pour centrer horizontalement et verticalement */
        <div className={styles.container}>
            <DoctorAvailabilities 
                availableSlots={slots} 
                onSelectSlot={(slot) => console.log('Selected slot:', slot)} 
                maxRows={5} 
            />
        </div>
    );
}