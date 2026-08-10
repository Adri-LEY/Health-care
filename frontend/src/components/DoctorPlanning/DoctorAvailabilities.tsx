import React, { useState } from "react";
import styles from "./DoctorAvailabilities.module.css";
import { type TimeSlotProps, toDateKey, getMonday, addDays } from "./dateUtils"; 
import { SlotsGrid } from "./SlotsGrid";

interface DoctorAvailabilitiesProps {
  availableSlots?: TimeSlotProps[];
  currentMonday?: Date;
  onWeekChange?: (newMonday: Date) => void;
  onSelectSlot?: (slot: TimeSlotProps) => void;
  maxRows?: number;
}

export function DoctorAvailabilities({
  availableSlots = [],
  currentMonday: externalMonday,
  onWeekChange,
  onSelectSlot,
  maxRows = 4,
}: DoctorAvailabilitiesProps) {
  // Gestion locale de secours au cas où les props ne sont pas transmises
  const [localMonday, setLocalMonday] = useState<Date>(() => getMonday(new Date()));
  const currentMonday = externalMonday || localMonday;

  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const weekDays = Array.from({ length: 6 }).map((_, i) => addDays(currentMonday, i));

  const dayNameFormatter = new Intl.DateTimeFormat("fr-FR", { weekday: "long" });
  const dayDateFormatter = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long" });

  const handleWeekChange = (offset: number) => {
    const nextMonday = addDays(currentMonday, offset);
    setIsExpanded(false);

    if (onWeekChange) {
      // Notifie le composant parent pour recharger l'API
      onWeekChange(nextMonday);
    } else {
      setLocalMonday(nextMonday);
    }
  };

  const hasMoreSlots = weekDays.some((day) => {
    const targetDateKey = toDateKey(day);
    const daySlots = availableSlots.filter((s) => {
      const slotDateKey = toDateKey(s.date || s.startTime);
      return slotDateKey === targetDateKey && !s.isLocked;
    });
    return daySlots.length > maxRows;
  });

  const currentMaxRows = isExpanded ? undefined : maxRows;

  return (
    <div className={styles["doctor-availabilities"]}>
      {/* EN-TÊTE */}
      <div className={styles["calendar-header"]}>
        <h2>Créneaux</h2>
        <button type="button" className={styles["calendar-header-icon"]}>
          <svg width="20" height="20" fill="none" stroke="#111827" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {/* NAVIGATION */}
      <div className={styles["calendar-nav-container"]}>
        <button 
          type="button" 
          onClick={() => handleWeekChange(-7)} 
          className={styles["nav-arrow"]}
        >
          ‹
        </button>
        
        <div className={styles["days-header-grid"]}>
          {weekDays.map((day) => (
            <div key={day.toISOString()} className={styles["day-header-cell"]}>
              <span className={styles["day-name"]}>{dayNameFormatter.format(day)}</span>
              <span className={styles["day-date"]}>{dayDateFormatter.format(day)}</span>
            </div>
          ))}
        </div>

        <button 
          type="button" 
          onClick={() => handleWeekChange(7)} 
          className={styles["nav-arrow"]}
        >
          ›
        </button>
      </div>

      <SlotsGrid 
        availableSlots={availableSlots} 
        onSelectSlot={onSelectSlot} 
        weekDays={weekDays} 
        maxRows={currentMaxRows} 
      />

      {hasMoreSlots && (
        <div className={styles["more-slots-container"]}>
          <button
            type="button"
            className={styles["more-slots-button"]}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Voir moins" : "Voir plus de disponibilités"}
          </button>
        </div>
      )}
    </div>
  );
}