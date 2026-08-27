import { toDateKey, type TimeSlotProps } from "./dateUtils";
import { TimeSlot } from "./TimeSlot";
import styles from "./SlotsGrid.module.css";

export function SlotsGrid({
    availableSlots,
    onSelectSlot,
    weekDays,
    maxRows,
}: {
    availableSlots: TimeSlotProps[];
    onSelectSlot?: (slot: TimeSlotProps) => void;
    weekDays: Date[];
    maxRows?: number;
}) {
    // Calcule le nombre total de créneaux par jour pour déterminer le nombre de lignes à rendre
    const daysSlotsList = weekDays.map((day) => {
        const targetDateKey = toDateKey(day);
        return {
            targetDateKey,
            slots: availableSlots.filter((s) => {
                const slotDateKey = toDateKey(s.date || s.startTime);
                return slotDateKey === targetDateKey && !s.isLocked;
            }),
        };
    });

    // Si maxRows est fourni, on l'utilise, sinon on prend la taille max des créneaux trouvés
    const maxSlotsInWeek = Math.max(...daysSlotsList.map((d) => d.slots.length), 0);
    const rowsToRender = maxRows ?? Math.max(maxSlotsInWeek, 4);

    return (
        <div className={styles["slots-grid"]}>
            {daysSlotsList.map(({ targetDateKey, slots }) => (
                <div key={targetDateKey} className={styles["slot-column"]}>
                    {Array.from({ length: rowsToRender }).map((_, rowIndex) => {
                        const slot = slots[rowIndex];

                        return (
                            <TimeSlot
                                key={slot ? slot.id : `empty-${targetDateKey}-${rowIndex}`}
                                slot={slot}
                                onSelectSlot={onSelectSlot}
                                targetDateKey={targetDateKey}
                                rowIndex={rowIndex}
                            />
                        );
                    })}
                </div>
            ))}
        </div>
    );
}