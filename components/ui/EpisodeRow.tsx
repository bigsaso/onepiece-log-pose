'use client';

import type { Episode } from '../../types';
import { colors } from '../../theme/colors';
import styles from './EpisodeRow.module.css';

interface Props {
  episode: Episode;
  onToggle: (ep: Episode) => void;
}

const TYPE_LABELS: Record<string, string> = {
  manga_canon: 'CANON',
  'mixed_canon/filler': 'MIXED',
  anime_canon: 'ANIME',
  filler: 'FILLER',
};

const TYPE_COLORS: Record<string, string> = {
  manga_canon: colors.ocean,
  'mixed_canon/filler': colors.gold,
  anime_canon: colors.oceanSoft,
  filler: colors.inkFaint,
};

export default function EpisodeRow({ episode, onToggle }: Props) {
  return (
    <div className={styles.row} data-watched={episode.watched}>
      <label className={styles.check}>
        <input
          type="checkbox"
          checked={episode.watched}
          onChange={() => onToggle(episode)}
        />
        <span className={styles.checkmark} />
      </label>
      <span className={styles.number}>#{episode.number}</span>
      <span className={styles.title}>{episode.title}</span>
      <span
        className={styles.badge}
        style={{ color: TYPE_COLORS[episode.type] || colors.inkFaint }}
      >
        {TYPE_LABELS[episode.type] || episode.type}
      </span>
    </div>
  );
}
