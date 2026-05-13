'use client';

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import Globe from './Globe';
import SagaMarkers from './SagaMarker';
import ArcMarkers from './ArcMarker';
import { useStore } from '../../store/useStore';
import { getSagaCenters, ARC_POSITIONS } from '../../data/coordinates';
import { pctToVector3 } from '../../utils/geo';
import { RADIUS } from './Globe';

const DEFAULT_CAM_DIST = 6;
const SAGA_CAM_DIST = 3.8;

export default function GlobeScene() {
  const selectedSaga = useStore((s) => s.selectedSaga);
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 0, DEFAULT_CAM_DIST));
  const animating = useRef(false);
  const initialFlown = useRef(false);

  useEffect(() => {
    if (initialFlown.current) return;
    initialFlown.current = true;
    const arc = useStore.getState().currentArc();
    if (!arc) return;
    const posData = ARC_POSITIONS.find((p) => p.arcName === arc.name);
    if (!posData) return;
    const dir = pctToVector3(posData.x, posData.y, 1).normalize();
    targetPos.current = dir.multiplyScalar(DEFAULT_CAM_DIST);
    animating.current = true;
  }, []);

  useEffect(() => {
    if (selectedSaga) {
      const centers = getSagaCenters();
      const center = centers.find((c) => c.sagaName === selectedSaga.name);
      if (center) {
        const dir = pctToVector3(center.x, center.y, 1).normalize();
        targetPos.current = dir.multiplyScalar(SAGA_CAM_DIST);
        animating.current = true;
      }
    } else {
      const arc = useStore.getState().currentArc();
      if (arc) {
        const posData = ARC_POSITIONS.find((p) => p.arcName === arc.name);
        if (posData) {
          const dir = pctToVector3(posData.x, posData.y, 1).normalize();
          targetPos.current = dir.multiplyScalar(DEFAULT_CAM_DIST);
          animating.current = true;
          return;
        }
      }
      targetPos.current = new THREE.Vector3(0, 0, DEFAULT_CAM_DIST);
      animating.current = true;
    }
  }, [selectedSaga, camera]);

  useFrame(() => {
    if (animating.current) {
      camera.position.lerp(targetPos.current, 0.04);
      camera.lookAt(0, 0, 0);
      if (camera.position.distanceTo(targetPos.current) < 0.01) {
        animating.current = false;
      }
    }
  });

  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 3, 5]} intensity={1.8} />
      <directionalLight position={[-4, 2, -4]} intensity={0.8} />
      <directionalLight position={[0, -4, 2]} intensity={0.4} />

      <Stars
        radius={50}
        depth={50}
        count={3000}
        factor={4}
        saturation={0}
        fade
        speed={0.5}
      />

      <Globe />

      <SagaMarkers />
      <ArcMarkers />

      <OrbitControls
        enablePan={false}
        minDistance={2.8}
        maxDistance={10}
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.5}
        zoomSpeed={0.35}
      />
    </>
  );
}
