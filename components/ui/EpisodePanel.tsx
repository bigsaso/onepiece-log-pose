'use client';

import { useStore } from '../../store/useStore';
import EpisodeRow from './EpisodeRow';
import styles from './EpisodePanel.module.css';

export default function EpisodePanel() {
  const selectedArc = useStore((s) => s.selectedArc);
  const selectArc = useStore((s) => s.selectArc);
  const episodes = useStore((s) =>
    selectedArc ? s.episodes[selectedArc.id] ?? null : null,
  );
  const toggleEpisodeWatched = useStore((s) => s.toggleEpisodeWatched);
  const batchMarkWatched = useStore((s) => s.batchMarkWatched);

  if (!selectedArc) return null;

  const watchedCount = episodes?.filter((e) => e.watched).length ?? 0;
  const totalCount = episodes?.length ?? 0;
  const pct = totalCount > 0 ? Math.round((watchedCount / totalCount) * 100) : 0;

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <button className={styles.closeBtn} onClick={() => selectArc(null)}>
          &times;
        </button>
        <h2 className={styles.arcName}>{selectedArc.name}</h2>
        <p className={styles.sagaName}>{selectedArc.saga_name} Saga</p>
        <div className={styles.progressRow}>
          <div className={styles.barOuter}>
            <div className={styles.barInner} style={{ width: `${pct}%` }} />
          </div>
          <span className={styles.progressText}>
            {watchedCount}/{totalCount} ({pct}%)
          </span>
        </div>
        <div className={styles.actions}>
          <button
            className={styles.actionBtn}
            onClick={() => batchMarkWatched(selectedArc.id, true)}
          >
            Mark All Watched
          </button>
          <button
            className={`${styles.actionBtn} ${styles.actionBtnReset}`}
            onClick={() => batchMarkWatched(selectedArc.id, false)}
          >
            Reset
          </button>
        </div>
      </div>
      <div className={styles.list}>
        {!episodes ? (
          <p className={styles.loading}>Loading episodes...</p>
        ) : (
          episodes.map((ep) => (
            <EpisodeRow
              key={ep.number}
              episode={ep}
              onToggle={toggleEpisodeWatched}
            />
          ))
        )}
      </div>
    </div>
  );
}
