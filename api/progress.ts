import { apiFetch } from './client';
import type { Progress } from '../types';

export function getProgress() {
  return apiFetch<Progress>('/progress');
}
