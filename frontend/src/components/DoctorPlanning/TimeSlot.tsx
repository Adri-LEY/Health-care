import type { TimeSlotProps } from "./dateUtils";
import { formatSlotTime } from "./dateUtils";
import styles from "./TimeSlot.module.css";

export function TimeSlot(
    { slot, onSelectSlot, targetDateKey, rowIndex }: 
    { slot: TimeSlotProps; onSelectSlot?: (slot: TimeSlotProps) => void; targetDateKey: string; rowIndex: number }
) {
    return (
        <>
            {slot ? (
                <button
                    key={slot.id}
                    type="button"
                    onClick={() => onSelectSlot && onSelectSlot(slot)}
                    className={styles["slot-button"]}
                >
                    {/* Affiche l'heure formatée à partir de startTime */}
                    {formatSlotTime(slot.startTime)}
                </button>
            ) : (

                <div key={`empty-${targetDateKey}-${rowIndex}`} className={styles["slot-empty"]}>
                    —
                </div>
            )}
        </>
    );
}