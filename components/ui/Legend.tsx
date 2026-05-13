'use client';

import { colors } from '../../theme/colors';
import styles from './Legend.module.css';

export default function Legend() {
  return (
    <div className={styles.legend}>
      <div className={styles.row}>
        <div className={styles.dot} style={{ backgroundColor: colors.ocean }} />
        <span className={styles.text}>CONQUERED</span>
      </div>
      <div className={styles.row}>
        <div className={styles.dot} style={{ backgroundColor: colors.accent }} />
        <span className={styles.text}>IN PORT</span>
      </div>
      <div className={styles.row}>
        <div className={styles.dot} style={{ backgroundColor: colors.paper }} />
        <span className={styles.text}>UNCHARTED</span>
      </div>
    </div>
  );
}
