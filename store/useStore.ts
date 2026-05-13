'use client';

import { create } from 'zustand';
import type { Saga, Arc, Episode, Progress } from '../types';
import type { ShipOverride } from '../data/ships';
import { getSagas } from '../api/sagas';
import { getArcs } from '../api/arcs';
import { getEpisodes, setWatched, batchSetWatched } from '../api/episodes';
import { getProgress } from '../api/progress';

interface StoreState {
  sagas: Saga[];
  arcs: Arc[];
  progress: Progress;
  episodes: Record<number, Episode[]>;
  selectedSaga: Saga | null;
  selectedArc: Arc | null;
  loading: boolean;

  fetchAll: () => Promise<void>;
  selectSaga: (saga: Saga | null) => void;
  selectArc: (arc: Arc | null) => void;
  fetchEpisodes: (arcId: number) => Promise<void>;
  toggleEpisodeWatched: (ep: Episode) => Promise<void>;
  batchMarkWatched: (arcId: number, watched: boolean) => Promise<void>;

  currentSaga: () => Saga | null;
  currentArc: () => Arc | null;

  shipOverride: ShipOverride;
  setShipOverride: (v: ShipOverride) => void;

  crewOpen: boolean;
  setCrewOpen: (v: boolean) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  sagas: [],
  arcs: [],
  progress: { total_non_filler: 0, watched: 0, percentage: 0 },
  episodes: {},
  selectedSaga: null,
  selectedArc: null,
  loading: true,

  fetchAll: async () => {
    set({ loading: true });
    const [sagaRes, arcRes, prog] = await Promise.all([
      getSagas(),
      getArcs(),
      getProgress(),
    ]);
    set({
      sagas: sagaRes.sagas,
      arcs: arcRes.arcs,
      progress: prog,
      loading: false,
    });
  },

  selectSaga: (saga) => set({ selectedSaga: saga, selectedArc: null }),
  selectArc: (arc) => set({ selectedArc: arc }),

  fetchEpisodes: async (arcId) => {
    const res = await getEpisodes(arcId);
    set((s) => ({ episodes: { ...s.episodes, [arcId]: res.episodes } }));
  },

  toggleEpisodeWatched: async (ep) => {
    const newWatched = !ep.watched;
    set((s) => {
      const arcEps = s.episodes[ep.arc_id!] ?? [];
      return {
        episodes: {
          ...s.episodes,
          [ep.arc_id!]: arcEps.map((e) =>
            e.number === ep.number ? { ...e, watched: newWatched } : e,
          ),
        },
      };
    });
    await setWatched(ep.number, newWatched);
    const [sagaRes, arcRes, prog] = await Promise.all([
      getSagas(),
      getArcs(),
      getProgress(),
    ]);
    set({ sagas: sagaRes.sagas, arcs: arcRes.arcs, progress: prog });
  },

  batchMarkWatched: async (arcId, watched) => {
    const eps = get().episodes[arcId];
    if (!eps) return;
    const numbers = eps.map((e) => e.number);
    set((s) => ({
      episodes: {
        ...s.episodes,
        [arcId]: eps.map((e) => ({ ...e, watched })),
      },
    }));
    await batchSetWatched(numbers, watched);
    const [sagaRes, arcRes, prog] = await Promise.all([
      getSagas(),
      getArcs(),
      getProgress(),
    ]);
    set({ sagas: sagaRes.sagas, arcs: arcRes.arcs, progress: prog });
  },

  currentSaga: () => {
    const { sagas } = get();
    return sagas.find((s) => s.watched_episodes < s.total_episodes) ?? sagas[0] ?? null;
  },

  currentArc: () => {
    const { arcs } = get();
    const saga = get().currentSaga();
    if (!saga) return null;
    const sagaArcs = arcs.filter((a) => a.saga_id === saga.id);
    return sagaArcs.find((a) => a.watched_episodes < a.total_episodes) ?? null;
  },

  shipOverride: 'auto',
  setShipOverride: (v) => set({ shipOverride: v }),

  crewOpen: false,
  setCrewOpen: (v) => set({ crewOpen: v }),
}));
