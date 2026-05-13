import { apiFetch } from './client';
import type { Episode } from '../types';

export function getEpisodes(arcId: number) {
  return apiFetch<{ episodes: Episode[]; total: number }>(`/episodes?arc_id=${arcId}`);
}

export function setWatched(episodeNumber: number, watched: boolean) {
  return apiFetch<{ number: number; watched: boolean }>(
    `/episodes/${episodeNumber}/watched`,
    { method: 'PATCH', body: JSON.stringify({ watched }) },
  );
}

export function batchSetWatched(episodeNumbers: number[], watched: boolean) {
  return apiFetch<{ updated: number }>('/episodes/batch-watched', {
    method: 'PATCH',
    body: JSON.stringify({ episode_numbers: episodeNumbers, watched }),
  });
}
