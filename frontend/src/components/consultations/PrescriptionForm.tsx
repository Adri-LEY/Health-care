import React from 'react';
import { PlusCircle, Trash2, FilePlus } from 'lucide-react';
import styles from './PrescriptionForm.module.css';
import InputField from '../InputField';

export type PrescriptionType = 'medication' | 'equipment' | 'care';

export interface CatalogItem {
  id: number;
  name?: string;
  description?: string;
  dosage?: string;
}

export interface ElementPrescriptionItem {
  type: PrescriptionType;
  medicationId?: number;
  equipmentId?: number;
  careId?: number;
  name: string;
  dosage?: string;
  duration: string;
  description: string; // 👈 Champ obligatoire
}

interface PrescriptionFormProps {
  showPrescription: boolean;
  setShowPrescription: (show: boolean) => void;
  items: ElementPrescriptionItem[];
  setItems: React.Dispatch<React.SetStateAction<ElementPrescriptionItem[]>>;
  medicationsList: CatalogItem[];
  equipmentsList: CatalogItem[];
  caresList: CatalogItem[];
}

export const PrescriptionForm: React.FC<PrescriptionFormProps> = ({
  showPrescription,
  setShowPrescription,
  items,
  setItems,
  medicationsList,
  equipmentsList,
  caresList,
}) => {
  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        type: 'medication',
        name: '',
        dosage: '',
        duration: '',
        description: '', // Initialisé à vide
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTypeChange = (index: number, newType: PrescriptionType) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        return {
          type: newType,
          name: '',
          dosage: '',
          duration: '',
          description: '',
        };
      })
    );
  };

  const handleSelectCatalogItem = (index: number, selectedId: number) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        if (item.type === 'medication') {
          const med = medicationsList.find((m) => m.id === selectedId);
          return {
            ...item,
            medicationId: selectedId,
            equipmentId: undefined,
            careId: undefined,
            name: med?.name || '',
            dosage: med?.dosage || '',
          };
        } else if (item.type === 'equipment') {
          const eq = equipmentsList.find((e) => e.id === selectedId);
          return {
            ...item,
            equipmentId: selectedId,
            medicationId: undefined,
            careId: undefined,
            name: eq?.name || '',
          };
        } else {
          const care = caresList.find((c) => c.id === selectedId);
          return {
            ...item,
            careId: selectedId,
            medicationId: undefined,
            equipmentId: undefined,
            name: care?.description || care?.name || '',
          };
        }
      })
    );
  };

  const handleFieldChange = (
    index: number,
    field: keyof ElementPrescriptionItem,
    value: string
  ) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  return (
    <div className={styles.prescriptionCard}>
      <div className={styles.prescriptionHeader}>
        <h3>Ordonnance associée</h3>
        <button
          type="button"
          className={styles.toggleButton}
          onClick={() => {
            if (!showPrescription && items.length === 0) {
              handleAddItem();
            }
            setShowPrescription(!showPrescription);
          }}
        >
          <FilePlus size={18} />
          {showPrescription ? "Masquer l'ordonnance" : 'Ajouter une ordonnance'}
        </button>
      </div>

      {showPrescription && (
        <div className={styles.itemsContainer}>
          {items.length === 0 ? (
            <div className={styles.emptyNotice}>
              Aucun élément dans l'ordonnance. Cliquez ci-dessous pour en ajouter un.
            </div>
          ) : (
            items.map((item, index) => (
              <div key={index} className={styles.itemCard}>
                <div className={styles.itemCardHeader}>
                  <div className={styles.typeSelector}>
                    <button
                      type="button"
                      className={`${styles.typeBtn} ${
                        item.type === 'medication' ? styles.active : ''
                      }`}
                      onClick={() => handleTypeChange(index, 'medication')}
                    >
                      Médicament
                    </button>
                    <button
                      type="button"
                      className={`${styles.typeBtn} ${
                        item.type === 'equipment' ? styles.active : ''
                      }`}
                      onClick={() => handleTypeChange(index, 'equipment')}
                    >
                      Matériel médical
                    </button>
                    <button
                      type="button"
                      className={`${styles.typeBtn} ${
                        item.type === 'care' ? styles.active : ''
                      }`}
                      onClick={() => handleTypeChange(index, 'care')}
                    >
                      Soin paramédical
                    </button>
                  </div>

                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={() => handleRemoveItem(index)}
                    title="Supprimer la prescription"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className={styles.gridFields}>
                  {/* Sélection depuis le catalogue */}
                  <div>
                    <label className={styles.label}>
                      {item.type === 'medication'
                        ? 'Médicament'
                        : item.type === 'equipment'
                        ? 'Matériel médical'
                        : 'Soin paramédical'}
                    </label>
                    <select
                      className={styles.selectInput}
                      value={
                        item.medicationId ||
                        item.equipmentId ||
                        item.careId ||
                        ''
                      }
                      onChange={(e) =>
                        handleSelectCatalogItem(index, Number(e.target.value))
                      }
                    >
                      <option value="">-- Sélectionner dans le catalogue --</option>
                      {item.type === 'medication' &&
                        medicationsList.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} {m.dosage ? `(${m.dosage})` : ''}
                          </option>
                        ))}
                      {item.type === 'equipment' &&
                        equipmentsList.map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.name}
                          </option>
                        ))}
                      {item.type === 'care' &&
                        caresList.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.description || c.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Champ Durée */}
                  <InputField
                    label="Durée *"
                    type="text"
                    value={item.duration}
                    onChange={(val) => handleFieldChange(index, 'duration', val)}
                    required
                    subtext="Ex: 5 jours, 3 semaines..."
                  />
                </div>

                <div className={styles.gridFields}>
                  {/* Champ Dosage (Optionnel ou pré-rempli) */}
                  <InputField
                    label="Dosage / Posologie"
                    type="text"
                    value={item.dosage || ''}
                    onChange={(val) => handleFieldChange(index, 'dosage', val)}
                    subtext="Ex: 1000mg, 1 comprimé 3x/jour..."
                  />

                  {/* Champ Description / Consignes (Obligatoire) */}
                  <InputField
                    label="Description / Instructions *"
                    type="text"
                    value={item.description}
                    onChange={(val) => handleFieldChange(index, 'description', val)}
                    required
                    subtext="Ex: À prendre au milieu des repas, application externe..."
                  />
                </div>
              </div>
            ))
          )}

          <button
            type="button"
            className={styles.addItemBtn}
            onClick={handleAddItem}
          >
            <PlusCircle size={18} />
            Ajouter une prescription
          </button>
        </div>
      )}
    </div>
  );
};