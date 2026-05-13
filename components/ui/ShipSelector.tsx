'use client';

import { useStore } from '../../store/useStore';
import { getShipForArc, SHIP_IMAGES, SHIP_LABELS, type ShipOverride } from '../../data/ships';
import { useRemovedBackground } from '../../hooks/useRemovedBackground';
import styles from './ShipSelector.module.css';

const OPTIONS: { value: ShipOverride; label: string }[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'going_merry', label: 'Going Merry' },
  { value: 'thousand_sunny', label: 'Thousand Sunny' },
];

export default function ShipSelector() {
  const shipOverride = useStore((s) => s.shipOverride);
  const setShipOverride = useStore((s) => s.setShipOverride);
  const currentArc = useStore((s) => s.currentArc());

  const activeShip =
    shipOverride === 'auto' ? getShipForArc(currentArc?.name ?? null) : shipOverride;

  const processedImg = useRemovedBackground(SHIP_IMAGES[activeShip]);

  return (
    <div className={styles.panel}>
      <img
        src={processedImg}
        alt={SHIP_LABELS[activeShip]}
        className={styles.shipImg}
      />
      <div className={styles.controls}>
        <span className={styles.label}>Ship</span>
        <div className={styles.buttons}>
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`${styles.btn} ${shipOverride === opt.value ? styles.btnActive : ''}`}
              onClick={() => setShipOverride(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
