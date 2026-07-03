import React from 'react';
import styles from './searchComponent.module.css';

type FilterOption = string | { id: number; name: string } | { id:string; name: string }; // Les options peuvent être des chaînes (rôles) ou des objets (Spécialités/Services)

interface FilterGroupProps {
  title: string;
  options: FilterOption[];
  // Les options sélectionnées contiennent soit des strings (rôles), soit des numbers (IDs)
  selectedOptions: (string | number)[];
  onToggle: (value: any) => void;
}

interface SearchComponentProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  groups: FilterGroupProps[];
}

export default function SearchComponent({ 
  searchTerm, 
  onSearchChange, 
  searchPlaceholder = "Rechercher...", 
  groups 
}: SearchComponentProps) {
  return (
    <div className={styles['filters-section']}>
      
      {/* 1. Barre de recherche textuelle */}
      <input
        type="text"
        placeholder={searchPlaceholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className={styles['search-bar']}
      />

      {/* 2. Conteneur dynamique des groupes de cases à cocher */}
      <div className={styles['checkbox-groups-container']}>
        {groups.map((group) => (
          <div key={group.title} className={styles['filter-group']}>
            <h4>{group.title} :</h4>
            <div className={styles['checkbox-list']}>
              {group.options.map((option) => {
                // On détecte si c'est un objet (Spécialités/Services) ou une string (Rôles)
                const isObject = typeof option === 'object' && option !== null;
                const optionId = isObject ? option.id : option;
                const optionLabel = isObject ? option.name : option;

                return (
                  // La key utilise maintenant l'ID unique (fini le bug du [object Object])
                  <label key={optionId} className={styles['checkbox-label']}>
                    <input 
                      type="checkbox" 
                      checked={group.selectedOptions.includes(optionId)} 
                      onChange={() => group.onToggle(optionId)} 
                    />
                    {optionLabel}
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}