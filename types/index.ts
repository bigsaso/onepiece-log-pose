export interface Episode {
  number: number;
  title: string;
  type: 'manga_canon' | 'mixed_canon/filler' | 'anime_canon' | 'filler';
  air_date: string | null;
  watched: boolean;
  arc_id: number | null;
  arc_name: string | null;
  saga_id: number | null;
  saga_name: string | null;
}

export interface Arc {
  id: number;
  name: string;
  saga_id: number;
  saga_name: string;
  sort_order: number;
  total_episodes: number;
  watched_episodes: number;
}

export interface Saga {
  id: number;
  name: string;
  sort_order: number;
  total_arcs: number;
  total_episodes: number;
  watched_episodes: number;
}

export interface Progress {
  total_non_filler: number;
  watched: number;
  percentage: number;
}
