'use client';

import { useStore } from '../../store/useStore';
import styles from './CrewPanel.module.css';

interface CrewMember {
  name: string;
  role: string;
  joinEpisode: number;
  image: string;
}

const CREW: CrewMember[] = [
  { name: 'Monkey D. Luffy', role: 'Captain',        joinEpisode: 1,   image: '/crew/luffy.jpg' },
  { name: 'Roronoa Zoro',    role: 'Swordsman',      joinEpisode: 3,   image: '/crew/zoro.jpg' },
  { name: 'Usopp',           role: 'Sniper',         joinEpisode: 17,  image: '/crew/usopp.jpg' },
  { name: 'Sanji',           role: 'Cook',           joinEpisode: 30,  image: '/crew/sanji.jpg' },
  { name: 'Nami',            role: 'Navigator',      joinEpisode: 44,  image: '/crew/nami.jpg' },
  { name: 'Tony Chopper',    role: 'Doctor',         joinEpisode: 91,  image: '/crew/chopper.jpg' },
  { name: 'Nico Robin',      role: 'Archaeologist',  joinEpisode: 130, image: '/crew/robin.jpg' },
  { name: 'Franky',          role: 'Shipwright',     joinEpisode: 322, image: '/crew/franky.jpg' },
  { name: 'Brook',           role: 'Musician',       joinEpisode: 381, image: '/crew/brook.jpg' },
  { name: 'Jinbe',           role: 'Helmsman',       joinEpisode: 833, image: '/crew/jinbe.jpg' },
];

export default function CrewPanel() {
  const open = useStore((s) => s.crewOpen);
  const setOpen = useStore((s) => s.setCrewOpen);
  const arcs = useStore((s) => s.arcs);

  const totalWatched = arcs.reduce((sum, arc) => sum + arc.watched_episodes, 0);

  return (
    <div className={`${styles.container} ${open ? styles.open : ''}`}>
      <button
        className={styles.tab}
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close crew panel' : 'Open crew panel'}
      >
        <span className={styles.tabLabel}>Crew</span>
        <span className={styles.tabArrow}>{open ? '‹' : '›'}</span>
      </button>

      <div className={styles.panel}>
        <div className={styles.header}>
          <span className={styles.title}>Straw Hat Pirates</span>
          <span className={styles.count}>
            {CREW.filter((m) => totalWatched >= m.joinEpisode).length}/{CREW.length}
          </span>
        </div>

        <div className={styles.list}>
          {CREW.map((member) => {
            const unlocked = totalWatched >= member.joinEpisode;
            return (
              <div
                key={member.name}
                className={`${styles.card} ${unlocked ? styles.unlocked : styles.locked}`}
              >
                {unlocked ? (
                  <img
                    src={member.image}
                    alt={member.name}
                    className={styles.avatar}
                  />
                ) : (
                  <span className={styles.avatarLocked}>❓</span>
                )}
                <div className={styles.info}>
                  <span className={styles.name}>{unlocked ? member.name : '???'}</span>
                  <span className={styles.role}>{unlocked ? member.role : `Ep ${member.joinEpisode}`}</span>
                </div>
                {unlocked && (
                  <span className={styles.joinEp}>ep {member.joinEpisode}</span>
                )}
              </div>
            );
          })}
        </div>

        <div className={styles.footer}>
          <div className={styles.barOuter}>
            <div
              className={styles.barInner}
              style={{
                width: `${Math.round(
                  (CREW.filter((m) => totalWatched >= m.joinEpisode).length / CREW.length) * 100,
                )}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
