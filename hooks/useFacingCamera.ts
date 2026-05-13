'use client';

import { useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const _camDir = new THREE.Vector3();

export function useFacingCamera(pos: THREE.Vector3, threshold = -0.1): boolean {
  const { camera } = useThree();
  const [visible, setVisible] = useState(true);

  useFrame(() => {
    _camDir.copy(camera.position).normalize();
    const dot = _camDir.dot(pos.clone().normalize());
    setVisible(dot > threshold);
  });

  return visible;
}
