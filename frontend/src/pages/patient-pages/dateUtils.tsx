export interface TimeSlot {
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

// Fonction pour grouper les slots par jour
export function groupSlotsByDay(slots: TimeSlot[]) {
  const grouped: { [key: string]: TimeSlot[] } = {};

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