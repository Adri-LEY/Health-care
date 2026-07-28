export interface TimeSlotProps {
  id: number;
  date: string;       // ex: "2026-07-28T00:00:00.000Z"
  startTime: string;  // ex: "2026-07-28T08:00:00.000Z"
  endTime: string;    // ex: "2026-07-28T08:30:00.000Z"
  isLocked?: boolean;
}

// Fonction pour extraire l'heure au format "08:00" en UTC strict
export function formatTimeUTC(isoString: string): string {
  const date = new Date(isoString);
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Formate un ISOString "2026-07-28T08:30:00.000Z" -> "08h30"
export const formatSlotTime = (isoString: string) => {
  const date = new Date(isoString);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}h${minutes}`;
};

// Extrait la clé "YYYY-MM-DD" d'un objet Date ou ISO string
export const toDateKey = (dateInput: Date | string) => {
  const d = new Date(dateInput);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Fonction pour grouper les slots par jour
export function groupSlotsByDay(slots: TimeSlotProps[]) {
  const grouped: { [key: string]: TimeSlotProps[] } = {};

  slots.forEach((slot) => {
    // Extraire seulement la partie date "2026-07-28"
    const dayKey = slot.date.split('T')[0];

    if (!grouped[dayKey]) {
      grouped[dayKey] = [];
    }
    grouped[dayKey].push(slot);
  });

  return grouped; // Ex: { "2026-07-28": [slot1, slot2], "2026-07-29": [slot3] }
}

export const getMonday = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};

export const addDays = (d: Date, days: number) => {
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
};
