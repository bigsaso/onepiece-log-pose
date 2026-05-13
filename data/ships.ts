export type ShipType = 'going_merry' | 'thousand_sunny';
export type ShipOverride = 'auto' | ShipType;

const GOING_MERRY_ARCS = new Set([
  'Romance Dawn', 'Orange Town', 'Syrup Village', 'Baratie', 'Arlong Park', 'Loguetown',
  'Reverse Mountain', 'Whisky Peak', 'Little Garden', 'Drum Island', 'Arabasta',
  'Jaya', 'Skypiea',
  'Long Ring Long Land', 'Water 7', 'Enies Lobby', 'Post-Enies Lobby',
]);

export function getShipForArc(arcName: string | null): ShipType {
  if (arcName && GOING_MERRY_ARCS.has(arcName)) return 'going_merry';
  return 'thousand_sunny';
}

export const SHIP_IMAGES: Record<ShipType, string> = {
  going_merry: '/ship-going-merry/wp-content/uploads/2025/07/going-merry-one-piece-ship-sticker-preview.jpg',
  thousand_sunny: '/ship-thousand-sunny/736x/ea/da/36/eada36d5deb9aba59e1344f6f07853a1.jpg',
};

export const SHIP_LABELS: Record<ShipType, string> = {
  going_merry: 'Going Merry',
  thousand_sunny: 'Thousand Sunny',
};
