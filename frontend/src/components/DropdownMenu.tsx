import { useState } from 'react';
import styles from './DropdownMenu.module.css';

interface DropdownItem {
    label: string;
    onClick: () => void;
}

interface DropdownMenuProps {
    triggerLabel?: string;
    items: DropdownItem[];
}

export default function DropdownMenu({ triggerLabel = 'Menu', items }: DropdownMenuProps) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    }

    return (
        <div className={styles.dropdown}>
            <button type="button" className={styles.dropdownButton} onClick={toggleDropdown}>
                {triggerLabel}
            </button>
            {isOpen && (
                <div className={styles.dropdownContent}>
                    {items.map((item, index) => (
                        <button
                            type="button"
                            key={index}
                            className={styles.dropdownItem}
                            onClick={() => {
                                toggleDropdown();
                                item.onClick();
                            }}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}