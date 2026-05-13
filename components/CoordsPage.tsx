'use client';

import { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { vector3ToPct, pctToVector3 } from '../utils/geo';
import { ARC_POSITIONS, type ArcPosition } from '../data/coordinates';

const RADIUS = 2;
const ARCS = ARC_POSITIONS;

type PlacedMap = Record<string, { x: number; y: number }>;

function CameraFlyTo({ target }: { target: THREE.Vector3 | null }) {
  const { camera } = useThree();
  const dest = useRef<THREE.Vector3>(camera.position.clone());
  const animating = useRef(false);

  useEffect(() => {
    if (!target) return;
    dest.current = target.clone().normalize().multiplyScalar(5.5);
    animating.current = true;
  }, [target]);

  useFrame(() => {
    if (!animating.current) return;
    camera.position.lerp(dest.current, 0.05);
    camera.lookAt(0, 0, 0);
    if (camera.position.distanceTo(dest.current) < 0.01) {
      animating.current = false;
    }
  });

  return null;
}

function GlobeMesh({ meshRef }: { meshRef: React.RefObject<THREE.Mesh | null> }) {
  const texture = useTexture('/map-image/lm93f2q9fqaf1.jpeg');
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[RADIUS, 64]} />
      <meshStandardMaterial map={texture} roughness={0.85} metalness={0.05} />
    </mesh>
  );
}

function RightClickPicker({
  meshRef,
  onPick,
}: {
  meshRef: React.RefObject<THREE.Mesh | null>;
  onPick: (pt: THREE.Vector3) => void;
}) {
  const { camera, gl } = useThree();
  const raycaster = useRef(new THREE.Raycaster());

  useEffect(() => {
    const canvas = gl.domElement;

    function handleContextMenu(e: MouseEvent) {
      e.preventDefault();
      if (!meshRef.current) return;
      const rect = canvas.getBoundingClientRect();
      const ndc = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.current.setFromCamera(ndc, camera);
      const hits = raycaster.current.intersectObject(meshRef.current);
      if (hits.length > 0) onPick(hits[0].point);
    }

    canvas.addEventListener('contextmenu', handleContextMenu);
    return () => canvas.removeEventListener('contextmenu', handleContextMenu);
  }, [camera, gl, meshRef, onPick]);

  return null;
}

function PlacedDot({ x, y }: { x: number; y: number; label: string }) {
  const pos = pctToVector3(x, y, RADIUS + 0.04);
  return (
    <group position={pos}>
      <mesh>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color="#2c5d80" />
      </mesh>
    </group>
  );
}

function GhostDot({ arc }: { arc: ArcPosition }) {
  const pos = pctToVector3(arc.x, arc.y, RADIUS + 0.04);
  return (
    <group position={pos}>
      <mesh>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color="#c89a3a" transparent opacity={0.5} />
      </mesh>
      <Html center distanceFactor={4} zIndexRange={[30, 20]} style={{ pointerEvents: 'none' }}>
        <div style={{
          fontFamily: "'Cutive Mono', monospace",
          fontSize: 10,
          color: '#c89a3a',
          background: 'rgba(10,22,40,0.8)',
          padding: '2px 6px',
          borderRadius: 3,
          border: '1px solid rgba(200,154,58,0.4)',
          whiteSpace: 'nowrap',
          marginTop: 4,
        }}>
          old pos
        </div>
      </Html>
    </group>
  );
}

function NewPin({ x, y }: { x: number; y: number }) {
  const pos = pctToVector3(x, y, RADIUS + 0.05);
  return (
    <group position={pos}>
      <mesh>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshBasicMaterial color="#c8472b" />
      </mesh>
      <Html center distanceFactor={4} zIndexRange={[40, 30]} style={{ pointerEvents: 'none' }}>
        <div style={{
          fontFamily: "'Cutive Mono', monospace",
          fontSize: 11,
          color: '#c8472b',
          background: 'rgba(10,22,40,0.85)',
          padding: '2px 7px',
          borderRadius: 3,
          border: '1px solid #c8472b',
          whiteSpace: 'nowrap',
          marginTop: 4,
        }}>
          {x}, {y}
        </div>
      </Html>
    </group>
  );
}

function Scene({
  onPick,
  current,
  placed,
  lastPlaced,
}: {
  onPick: (pt: THREE.Vector3) => void;
  current: ArcPosition | null;
  placed: PlacedMap;
  lastPlaced: { x: number; y: number } | null;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const flyTarget = current ? pctToVector3(current.x, current.y, RADIUS) : null;

  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[5, 3, 5]} intensity={1.0} />
      <CameraFlyTo target={flyTarget} />
      <Suspense fallback={null}>
        <GlobeMesh meshRef={meshRef} />
      </Suspense>
      <RightClickPicker meshRef={meshRef} onPick={onPick} />

      {ARCS.map((a) => {
        const key = `${a.sagaName}/${a.arcName}`;
        const p = placed[key];
        if (!p) return null;
        return <PlacedDot key={key} x={p.x} y={p.y} label={a.label} />;
      })}

      {current && <GhostDot arc={current} />}

      {lastPlaced && <NewPin x={lastPlaced.x} y={lastPlaced.y} />}

      <OrbitControls
        enablePan={false}
        minDistance={2.5}
        maxDistance={10}
        dampingFactor={0.05}
        enableDamping
        mouseButtons={{ LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE }}
      />
    </>
  );
}

function DoneScreen({ placed }: { placed: PlacedMap }) {
  const [copied, setCopied] = useState(false);

  const lines = ARCS.map((a) => {
    const key = `${a.sagaName}/${a.arcName}`;
    const p = placed[key] ?? { x: a.x, y: a.y };
    const changed = placed[key] && (placed[key].x !== a.x || placed[key].y !== a.y);
    return { a, p, changed };
  });

  const tsBlock = [
    'export const ARC_POSITIONS: ArcPosition[] = [',
    ...lines.map(({ a, p }) =>
      `  { arcName: '${a.arcName}', sagaName: '${a.sagaName}', x: ${p.x}, y: ${p.y}, label: '${a.label}' },`
    ),
    '];',
  ].join('\n');

  function copy() {
    navigator.clipboard.writeText(tsBlock);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const changedCount = lines.filter((l) => l.changed).length;

  return (
    <div style={{
      width: '100%', height: '100%', background: '#0a1628',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{
        padding: '20px 28px 16px',
        borderBottom: '1.5px solid rgba(200,154,58,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <h1 style={{ fontFamily: "'Caveat', cursive", fontSize: 28, color: '#f4efe2', margin: 0 }}>
            All arcs placed!
          </h1>
          <p style={{ fontFamily: "'Cutive Mono', monospace", fontSize: 12, color: '#8a93a3', margin: '4px 0 0' }}>
            {changedCount} position{changedCount !== 1 ? 's' : ''} updated · {ARCS.length - changedCount} unchanged
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <a href="/coords" style={{
            padding: '6px 14px',
            fontFamily: "'Cutive Mono', monospace", fontSize: 11,
            color: '#8a93a3', border: '1px solid rgba(138,147,163,0.3)',
            borderRadius: 4, textDecoration: 'none',
          }}>
            redo
          </a>
          <button onClick={copy} style={{
            padding: '8px 20px',
            fontFamily: "'Cutive Mono', monospace", fontSize: 12,
            background: copied ? 'rgba(47,122,77,0.3)' : 'rgba(44,93,128,0.4)',
            border: `1.5px solid ${copied ? '#2f7a4d' : 'rgba(44,93,128,0.7)'}`,
            borderRadius: 5, color: copied ? '#2f7a4d' : '#7ba8c4', cursor: 'pointer',
          }}>
            {copied ? '✓ copied!' : 'copy TypeScript'}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{ width: 260, overflowY: 'auto', borderRight: '1px solid rgba(200,154,58,0.15)', padding: '8px 0' }}>
          {lines.filter(l => l.changed).length === 0 && (
            <p style={{ padding: '16px', fontFamily: "'Patrick Hand', cursive", fontSize: 13, color: '#4a5566' }}>
              No positions changed.
            </p>
          )}
          {lines.map(({ a, p, changed }) => !changed ? null : (
            <div key={`${a.sagaName}/${a.arcName}`} style={{
              padding: '5px 14px',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}>
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: 14, color: '#f4efe2' }}>
                {a.label}
              </div>
              <div style={{ fontFamily: "'Cutive Mono', monospace", fontSize: 10, color: '#4a5566', marginTop: 1 }}>
                <span style={{ color: '#c8472b' }}>{a.x}, {a.y}</span>
                {' → '}
                <span style={{ color: '#2f7a4d' }}>{p.x}, {p.y}</span>
              </div>
            </div>
          ))}
        </div>

        <pre style={{
          flex: 1, margin: 0, overflowY: 'auto',
          padding: '16px 20px',
          fontFamily: "'Cutive Mono', monospace", fontSize: 12, lineHeight: 1.7,
          color: '#8a93a3',
          background: 'transparent',
          whiteSpace: 'pre-wrap', wordBreak: 'break-all',
        }}>
          {lines.map(({ a, p, changed }) => {
            const line = `  { arcName: '${a.arcName}', sagaName: '${a.sagaName}', x: ${p.x}, y: ${p.y}, label: '${a.label}' },`;
            return (
              <span key={`${a.sagaName}/${a.arcName}`} style={{ color: changed ? '#f4efe2' : '#4a5566' }}>
                {line}{'\n'}
              </span>
            );
          })}
        </pre>
      </div>
    </div>
  );
}

export default function CoordsPage() {
  const [step, setStep] = useState(0);
  const [placed, setPlaced] = useState<PlacedMap>({});
  const [lastPlaced, setLastPlaced] = useState<{ x: number; y: number } | null>(null);

  const isDone = step >= ARCS.length;
  const current = isDone ? null : ARCS[step];
  const prevArc = step > 0 ? ARCS[step - 1] : null;

  const sagaChanged = current && prevArc && current.sagaName !== prevArc.sagaName;

  function handlePick(pt: THREE.Vector3) {
    if (!current) return;
    const [x, y] = vector3ToPct(pt);
    const key = `${current.sagaName}/${current.arcName}`;
    setPlaced((prev) => ({ ...prev, [key]: { x, y } }));
    setLastPlaced({ x, y });
    setTimeout(() => {
      setLastPlaced(null);
      setStep((s) => s + 1);
    }, 600);
  }

  function goBack() {
    if (step === 0) return;
    const prev = ARCS[step - 1];
    const key = `${prev.sagaName}/${prev.arcName}`;
    setPlaced((p) => {
      const next = { ...p };
      delete next[key];
      return next;
    });
    setLastPlaced(null);
    setStep((s) => s - 1);
  }

  function skip() {
    setLastPlaced(null);
    setStep((s) => s + 1);
  }

  if (isDone) return <DoneScreen placed={placed} />;

  const progress = step / ARCS.length;
  const placedInSaga = ARCS.slice(0, step).filter((a) => a.sagaName === current!.sagaName).length;
  const totalInSaga = ARCS.filter((a) => a.sagaName === current!.sagaName).length;

  return (
    <div style={{ width: '100%', height: '100%', background: '#0a1628', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        padding: '14px 24px 12px',
        background: 'rgba(10,22,40,0.95)',
        borderBottom: '1.5px solid rgba(200,154,58,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div>
          {sagaChanged && (
            <div style={{
              fontFamily: "'Cutive Mono', monospace", fontSize: 10,
              color: '#c89a3a', letterSpacing: 1, textTransform: 'uppercase',
              marginBottom: 3,
            }}>
              ✦ now entering: {current!.sagaName} saga
            </div>
          )}
          <div style={{
            fontFamily: "'Caveat', cursive", fontSize: 26, fontWeight: 700, color: '#f4efe2',
            lineHeight: 1.1,
          }}>
            Where is <span style={{ color: '#c89a3a' }}>{current!.label}</span>?
          </div>
          <div style={{
            fontFamily: "'Cutive Mono', monospace", fontSize: 11, color: '#8a93a3', marginTop: 3,
          }}>
            {current!.arcName} · {current!.sagaName} Saga
            &nbsp;·&nbsp; {placedInSaga}/{totalInSaga} in saga
          </div>
        </div>

        <div style={{ textAlign: 'right', minWidth: 160 }}>
          <div style={{ fontFamily: "'Cutive Mono', monospace", fontSize: 13, color: '#f4efe2' }}>
            {step} <span style={{ color: '#4a5566' }}>/ {ARCS.length}</span>
          </div>
          <div style={{
            marginTop: 6, height: 4, width: 160,
            background: 'rgba(44,93,128,0.2)', borderRadius: 2, overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: `${progress * 100}%`,
              background: 'linear-gradient(90deg, #2c5d80, #c89a3a)',
              borderRadius: 2, transition: 'width 0.3s ease',
            }} />
          </div>
          <div style={{
            marginTop: 8, display: 'flex', justifyContent: 'flex-end', gap: 8,
          }}>
            <button onClick={goBack} disabled={step === 0} style={{
              padding: '3px 12px',
              fontFamily: "'Cutive Mono', monospace", fontSize: 11,
              background: 'transparent',
              border: '1px solid rgba(138,147,163,0.3)',
              borderRadius: 4, color: step === 0 ? '#2a3444' : '#8a93a3',
              cursor: step === 0 ? 'default' : 'pointer',
            }}>
              ← back
            </button>
            <button onClick={skip} style={{
              padding: '3px 12px',
              fontFamily: "'Cutive Mono', monospace", fontSize: 11,
              background: 'transparent',
              border: '1px solid rgba(138,147,163,0.3)',
              borderRadius: 4, color: '#8a93a3', cursor: 'pointer',
            }}>
              skip →
            </button>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative' }} onContextMenu={(e) => e.preventDefault()}>
        <Canvas camera={{ position: [0, 0, 6], fov: 45, near: 0.1, far: 100 }}>
          <Scene
            onPick={handlePick}
            current={current}
            placed={placed}
            lastPlaced={lastPlaced}
          />
        </Canvas>

        <div style={{
          position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
          fontFamily: "'Cutive Mono', monospace", fontSize: 11, color: '#4a5566',
          pointerEvents: 'none',
        }}>
          gold dot = current known position · left drag to rotate · right click to place
        </div>
      </div>
    </div>
  );
}
