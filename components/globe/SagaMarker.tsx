'use client';

import { Html } from '@react-three/drei';
import { pctToVector3 } from '../../utils/geo';
import { getSagaCenters } from '../../data/coordinates';
import { useStore } from '../../store/useStore';
import { colors } from '../../theme/colors';
import { useFacingCamera } from '../../hooks/useFacingCamera';
import { useRemovedBackground } from '../../hooks/useRemovedBackground';
import { getShipForArc, SHIP_IMAGES } from '../../data/ships';
import type { Saga } from '../../types';
import { RADIUS } from './Globe';
import { useMemo } from 'react';
import * as THREE from 'three';

const MARKER_RADIUS = RADIUS + 0.02;

function dotColor(status: string) {
  if (status === 'done') return colors.ocean;
  if (status === 'current') return colors.accent;
  return colors.paper;
}

export default function SagaMarkers() {
  const sagas = useStore((s) => s.sagas);
  const selectedSaga = useStore((s) => s.selectedSaga);
  const selectSaga = useStore((s) => s.selectSaga);
  const currentSaga = useStore((s) => s.currentSaga());
  const currentArc = useStore((s) => s.currentArc());
  const shipOverride = useStore((s) => s.shipOverride);
  const sagaCenters = useMemo(() => getSagaCenters(), []);

  const shipImg = SHIP_IMAGES[
    shipOverride === 'auto' ? getShipForArc(currentArc?.name ?? null) : shipOverride
  ];

  if (selectedSaga) return null;

  return (
    <>
      {sagas.map((saga) => {
        const center = sagaCenters.find((c) => c.sagaName === saga.name);
        if (!center) return null;
        const pos = pctToVector3(center.x, center.y, MARKER_RADIUS);
        const status = getSagaStatus(saga, currentSaga);

        return (
          <SagaMarkerItem key={saga.id} pos={pos} saga={saga} status={status} onSelect={selectSaga} shipImg={shipImg} />
        );
      })}
    </>
  );
}

function SagaMarkerItem({
  pos,
  saga,
  status,
  onSelect,
  shipImg,
}: {
  pos: THREE.Vector3;
  saga: Saga;
  status: string;
  onSelect: (s: Saga) => void;
  shipImg: string;
}) {
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
                  onSelect(saga);
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  userSelect: 'none',
                }}
              >
                {status === 'current' && (
                  <img
                    src={processedShipImg}
                    alt="ship"
                    style={{ width: 48, height: 48, objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }}
                  />
                )}
                <div
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    backgroundColor: dotColor(status),
                    border: `1.5px solid ${colors.rule}`,
                    boxShadow:
                      status === 'current'
                        ? `0 0 8px ${colors.accent}`
                        : 'none',
                  }}
                />
                <div
                  style={{
                    background: status === 'done' ? colors.oceanPale : colors.paper,
                    padding: '1px 6px',
                    borderRadius: '3px',
                    border: `1px solid ${status === 'current' ? colors.accent : colors.inkSoft}`,
                    borderWidth: status === 'current' ? '1.5px' : '1px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Caveat', cursive",
                      fontSize: '13px',
                      color: colors.ink,
                      fontWeight: status === 'current' ? 700 : 400,
                    }}
                  >
                    {saga.name}
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: "'Cutive Mono', monospace",
                    fontSize: '9px',
                    color: colors.inkSoft,
                  }}
                >
                  {saga.watched_episodes}/{saga.total_episodes}
                </span>
              </div>
            </Html>
          </group>
  );
}

function getSagaStatus(saga: Saga, currentSaga: Saga | null): string {
  if (saga.watched_episodes >= saga.total_episodes && saga.total_episodes > 0)
    return 'done';
  if (saga.watched_episodes > 0 || saga.id === currentSaga?.id) return 'current';
  return 'next';
}
