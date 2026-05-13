export interface ArcPosition {
  arcName: string;
  sagaName: string;
  x: number;
  y: number;
  label: string;
}

export const ARC_POSITIONS: ArcPosition[] = [
  // East Blue
  { arcName: 'Romance Dawn', sagaName: 'East Blue', x: 38, y: 19, label: 'Foosha Village' },
  { arcName: 'Orange Town', sagaName: 'East Blue', x: 28.1, y: 21.4, label: 'Orange Town' },
  { arcName: 'Syrup Village', sagaName: 'East Blue', x: 21.1, y: 23.5, label: 'Syrup Village' },
  { arcName: 'Baratie', sagaName: 'East Blue', x: 19.8, y: 31.5, label: 'Baratie' },
  { arcName: 'Arlong Park', sagaName: 'East Blue', x: 12.2, y: 21.1, label: 'Arlong Park' },
  { arcName: 'Loguetown', sagaName: 'East Blue', x: 5.2, y: 33.8, label: 'Loguetown' },
  // Arabasta
  { arcName: 'Reverse Mountain', sagaName: 'Arabasta', x: 5.9, y: 51, label: 'Reverse Mt.' },
  { arcName: 'Whisky Peak', sagaName: 'Arabasta', x: 7.3, y: 48, label: 'Whiskey Peak' },
  { arcName: 'Little Garden', sagaName: 'Arabasta', x: 10.1, y: 46.3, label: 'Little Garden' },
  { arcName: 'Drum Island', sagaName: 'Arabasta', x: 13.4, y: 45.8, label: 'Drum Island' },
  { arcName: 'Arabasta', sagaName: 'Arabasta', x: 18.4, y: 45, label: 'Arabasta' },
  // Sky Island
  { arcName: 'Jaya', sagaName: 'Sky Island', x: 22.7, y: 49.1, label: 'Jaya' },
  { arcName: 'Skypiea', sagaName: 'Sky Island', x: 25.1, y: 48.2, label: 'Skypiea' },
  // Water 7
  { arcName: 'Long Ring Long Land', sagaName: 'Water 7', x: 27.7, y: 51.9, label: 'Long Ring' },
  { arcName: 'Water 7', sagaName: 'Water 7', x: 35, y: 51.7, label: 'Water 7' },
  { arcName: 'Enies Lobby', sagaName: 'Water 7', x: 39.8, y: 54.6, label: 'Enies Lobby' },
  { arcName: 'Post-Enies Lobby', sagaName: 'Water 7', x: 35.2, y: 51.5, label: 'Water 7' },
  // Thriller Bark
  { arcName: 'Thriller Bark', sagaName: 'Thriller Bark', x: 39.2, y: 49.7, label: 'Thriller Bark' },
  // Summit War
  { arcName: 'Sabaody Archipelago', sagaName: 'Summit War', x: 44.7, y: 51.5, label: 'Sabaody' },
  { arcName: 'Amazon Lily', sagaName: 'Summit War', x: 39.1, y: 60.3, label: 'Amazon Lily' },
  { arcName: 'Impel Down', sagaName: 'Summit War', x: 42.5, y: 59.5, label: 'Impel Down' },
  { arcName: 'Marineford', sagaName: 'Summit War', x: 45.1, y: 54.8, label: 'Marineford' },
  { arcName: 'Post-War', sagaName: 'Summit War', x: 45.1, y: 51.1, label: 'Sabaody' },
  // Fish-Man Island
  { arcName: 'Return to Sabaody', sagaName: 'Fish-Man Island', x: 44.5, y: 50.8, label: 'Sabaody' },
  { arcName: 'Fish-Man Island', sagaName: 'Fish-Man Island', x: 47.9, y: 50.9, label: 'Fish-Man Is.' },
  // Dressrosa
  { arcName: 'Punk Hazard', sagaName: 'Dressrosa', x: 56.3, y: 54.6, label: 'Punk Hazard' },
  { arcName: 'Dressrosa', sagaName: 'Dressrosa', x: 65.1, y: 52.1, label: 'Dressrosa' },
  // Whole Cake Island
  { arcName: 'Zou', sagaName: 'Whole Cake Island', x: 75.4, y: 53.7, label: 'Zou' },
  { arcName: 'Whole Cake Island', sagaName: 'Whole Cake Island', x: 72.7, y: 47.2, label: 'Whole Cake' },
  { arcName: 'Levely', sagaName: 'Whole Cake Island', x: 51.2, y: 49.7, label: 'Mariejois' },
  // Wano Country
  { arcName: 'Wano Country', sagaName: 'Wano Country', x: 81.1, y: 44.4, label: 'Wano' },
  // Final
  { arcName: 'Egghead', sagaName: 'Final', x: 81.8, y: 50.4, label: 'Egghead' },
  { arcName: 'Elbaph', sagaName: 'Final', x: 85.8, y: 48.1, label: 'Elbaf' },
];

export interface SagaCenter {
  sagaName: string;
  x: number;
  y: number;
}

export function getSagaCenters(): SagaCenter[] {
  const map = new Map<string, { xs: number[]; ys: number[] }>();
  for (const arc of ARC_POSITIONS) {
    if (!map.has(arc.sagaName)) map.set(arc.sagaName, { xs: [], ys: [] });
    const e = map.get(arc.sagaName)!;
    e.xs.push(arc.x);
    e.ys.push(arc.y);
  }
  const centers: SagaCenter[] = [];
  for (const [name, { xs, ys }] of map) {
    centers.push({
      sagaName: name,
      x: Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10,
      y: Math.round((ys.reduce((a, b) => a + b, 0) / ys.length) * 10) / 10,
    });
  }
  return centers;
}
