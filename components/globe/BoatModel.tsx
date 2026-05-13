'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { pctToVector3 } from '../../utils/geo';
import { ARC_POSITIONS } from '../../data/coordinates';
import { useStore } from '../../store/useStore';
import { RADIUS } from './Globe';

const BOAT_RADIUS = RADIUS + 0.08;

export default function BoatModel() {
  const groupRef = useRef<THREE.Group>(null);
  const currentArc = useStore((s) => s.currentArc());

  const arcPos = currentArc
    ? ARC_POSITIONS.find(
        (p) => p.arcName === currentArc.name,
      )
    : null;

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime;
      groupRef.current.position.y = Math.sin(t * 2) * 0.015;
    }
  });

  if (!arcPos) return null;

  const pos = pctToVector3(arcPos.x, arcPos.y, BOAT_RADIUS);

  return (
    <group position={pos}>
      <group ref={groupRef}>
        <Html
          center
          distanceFactor={4}
          style={{ pointerEvents: 'none' }}
          zIndexRange={[20, 10]}
        >
          <div
            style={{
              fontSize: '28px',
              lineHeight: '32px',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
              animation: 'bob 3s ease-in-out infinite',
            }}
          >
            &#9973;
          </div>
        </Html>
      </group>
    </group>
  );
}
