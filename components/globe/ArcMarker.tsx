'use client';

import { Html } from '@react-three/drei';
import { pctToVector3 } from '../../utils/geo';
import { ARC_POSITIONS } from '../../data/coordinates';
import { useStore } from '../../store/useStore';
import { colors } from '../../theme/colors';
import { useFacingCamera } from '../../hooks/useFacingCamera';
import { useRemovedBackground } from '../../hooks/useRemovedBackground';
import { getShipForArc, SHIP_IMAGES } from '../../data/ships';
import type { Arc } from '../../types';
import { RADIUS } from './Globe';
import * as THREE from 'three';

const MARKER_RADIUS = RADIUS + 0.02;

function dotColor(status: string) {
  if (status === 'done') return colors.ocean;
  if (status === 'current') return colors.accent;
  return colors.paper;
}

export default function ArcMarkers() {
  const selectedSaga = useStore((s) => s.selectedSaga);
  const arcs = useStore((s) => s.arcs);
  const selectArc = useStore((s) => s.selectArc);
  const fetchEpisodes = useStore((s) => s.fetchEpisodes);
  const currentArc = useStore((s) => s.currentArc());
  const shipOverride = useStore((s) => s.shipOverride);

  const shipImg = SHIP_IMAGES[
    shipOverride === 'auto' ? getShipForArc(currentArc?.name ?? null) : shipOverride
  ];

  if (!selectedSaga) return null;

  const sagaArcs = arcs.filter((a) => a.saga_id === selectedSaga.id);

  return (
    <>
      {sagaArcs.map((arc) => {
        const posData = ARC_POSITIONS.find(
          (p) => p.arcName === arc.name && p.sagaName === selectedSaga.name,
        );
        if (!posData) return null;
        const pos = pctToVector3(posData.x, posData.y, MARKER_RADIUS);
        const status = getArcStatus(arc, currentArc);

        return (
          <ArcMarkerItem
            key={arc.id}
            pos={pos}
            arc={arc}
            posData={posData}
            status={status}
            isCurrent={currentArc?.id === arc.id}
            onSelect={() => { fetchEpisodes(arc.id); selectArc(arc); }}
            shipImg={shipImg}
          />
        );
      })}
    </>
  );
}

interface ArcMarkerItemProps {
  pos: THREE.Vector3;
  arc: Arc;
  posData: { label: string };
  status: string;
  isCurrent: boolean;
  onSelect: () => void;
  shipImg: string;
}

function ArcMarkerItem({ pos, arc, posData, status, isCurrent, onSelect, shipImg }: ArcMarkerItemProps) {
  const visible = useFacingCamera(pos);
  const processedShipImg = useRemovedBackground(shipImg);
  if (!visible) return null;

  return (
          <group position={pos}>
            <Html
              center
              distanceFactor={5}
              style={{ pointerEvents: 'auto', cursor: 'pointer' }}
              zIndexRange={[10, 0]}
            >
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect();
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  userSelect: 'none',
                }}
              >
                {isCurrent && (
                  <img
                    src={processedShipImg}
                    alt="ship"
                    style={{ width: 48, height: 48, objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }}
                  />
                )}
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: dotColor(status),
                    border: `1.5px solid ${colors.rule}`,
                    boxShadow:
                      isCurrent
                        ? `0 0 6px ${colors.accent}`
                        : 'none',
                  }}
                />
                <div
                  style={{
                    background: status === 'done' ? colors.oceanPale : colors.paper,
                    padding: '1px 5px',
                    borderRadius: '3px',
                    border: `1px solid ${status === 'current' ? colors.accent : colors.inkSoft}`,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Caveat', cursive",
                      fontSize: '11px',
                      color: colors.ink,
                      fontWeight: isCurrent ? 700 : 400,
                    }}
                  >
                    {posData.label}
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: "'Cutive Mono', monospace",
                    fontSize: '8px',
                    color: colors.inkSoft,
                  }}
                >
                  {arc.watched_episodes}/{arc.total_episodes}
                </span>
              </div>
            </Html>
          </group>
  );
}

function getArcStatus(arc: Arc, currentArc: Arc | null): string {
  if (arc.watched_episodes >= arc.total_episodes && arc.total_episodes > 0)
    return 'done';
  if (arc.watched_episodes > 0 || arc.id === currentArc?.id) return 'current';
  return 'next';
}
