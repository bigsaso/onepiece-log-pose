import { apiFetch } from './client';
import type { Saga } from '../types';

export function getSagas() {
  return apiFetch<{ sagas: Saga[] }>('/sagas');
}
