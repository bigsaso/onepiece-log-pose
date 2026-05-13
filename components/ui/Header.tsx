'use client';

import { useSession, signOut } from 'next-auth/react';
import { useStore } from '../../store/useStore';
import styles from './Header.module.css';

export default function Header() {
  const { data: session } = useSession();
  const progress = useStore((s) => s.progress);
  const selectedSaga = useStore((s) => s.selectedSaga);
  const selectSaga = useStore((s) => s.selectSaga);
  const crewOpen = useStore((s) => s.crewOpen);
  const episodePanelOpen = useStore((s) => !!s.selectedArc);

  const pct = progress.total_non_filler > 0
    ? Math.round((progress.watched / progress.total_non_filler) * 100)
    : 0;

  const leftOffset = crewOpen ? 260 + 28 : 28;
  const rightOffset = episodePanelOpen ? 360 : 0;

  return (
    <header
      className={styles.header}
      style={{ left: leftOffset, right: rightOffset }}
    >
      <div className={styles.row}>
        <div>
          <h1 className={styles.title}>Log Pose</h1>
          <p className={styles.subtitle}>grand line &middot; charting course</p>
        </div>
        <div className={styles.right}>
          <span className={styles.count}>
            {progress.watched.toLocaleString()} / {progress.total_non_filler.toLocaleString()}
          </span>
          <span className={styles.pct}>{pct}%</span>
        </div>
        {session?.user && (
          <div className={styles.userSection}>
            {session.user.image && (
              <img
                src={session.user.image}
                alt=""
                className={styles.avatar}
              />
            )}
            <button
              className={styles.signOutBtn}
              onClick={() => signOut()}
            >
              Sign out
            </button>
          </div>
        )}
      </div>
      <div className={styles.barOuter}>
        <div
          className={styles.barInner}
          style={{ width: `${pct}%` }}
        />
      </div>
      {selectedSaga && (
        <button className={styles.backBtn} onClick={() => selectSaga(null)}>
          &larr; All Sagas
        </button>
      )}
    </header>
  );
}
