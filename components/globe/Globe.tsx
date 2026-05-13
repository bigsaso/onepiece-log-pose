'use client';

import { useRef } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

const RADIUS = 2;
const ATMOSPHERE_RADIUS = 2.06;

export { RADIUS };

export default function Globe() {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture('/map-image/lm93f2q9fqaf1.jpeg');
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;

  return (
    <group>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[RADIUS, 64]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>

      <mesh>
        <icosahedronGeometry args={[ATMOSPHERE_RADIUS, 32]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          side={THREE.BackSide}
          vertexShader={atmosphereVertex}
          fragmentShader={atmosphereFragment}
          uniforms={{
            glowColor: { value: new THREE.Color('#2c5d80') },
          }}
        />
      </mesh>
    </group>
  );
}

const atmosphereVertex = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const atmosphereFragment = `
  uniform vec3 glowColor;
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vec3 viewDir = normalize(-vPosition);
    float intensity = pow(0.65 - dot(vNormal, viewDir), 3.0);
    gl_FragColor = vec4(glowColor, intensity * 0.5);
  }
`;
