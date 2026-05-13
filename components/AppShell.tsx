'use client';

import { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import GlobeScene from './globe/GlobeScene';
import Header from './ui/Header';
import Legend from './ui/Legend';
import EpisodePanel from './ui/EpisodePanel';
import ShipSelector from './ui/ShipSelector';
import CrewPanel from './ui/CrewPanel';
import { useStore } from '../store/useStore';
import styles from './App.module.css';

export default function AppShell() {
  const fetchAll = useStore((s) => s.fetchAll);
  const loading = useStore((s) => s.loading);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <h1 className={styles.loadingTitle}>Log Pose</h1>
        <p className={styles.loadingText}>Charting the Grand Line...</p>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45, near: 0.1, far: 100 }}
        className={styles.canvas}
      >
        <GlobeScene />
      </Canvas>
      <Header />
      <Legend />
      <ShipSelector />
      <CrewPanel />
      <EpisodePanel />
    </div>
  );
}
