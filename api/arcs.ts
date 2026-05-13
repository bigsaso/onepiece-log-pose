import { apiFetch } from './client';
import type { Arc } from '../types';

export function getArcs(sagaId?: number) {
  const q = sagaId ? `?saga_id=${sagaId}` : '';
  return apiFetch<{ arcs: Arc[] }>(`/arcs${q}`);
}
