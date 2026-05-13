import * as THREE from 'three';

const DEG2RAD = Math.PI / 180;

export function pctToLatLng(x: number, y: number): [lat: number, lng: number] {
  const lng = (x / 100) * 360 - 180;
  const lat = 90 - (y / 100) * 180;
  return [lat, lng];
}

export function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * DEG2RAD;
  const theta = (lng + 180) * DEG2RAD;
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

export function pctToVector3(x: number, y: number, radius: number): THREE.Vector3 {
  const [lat, lng] = pctToLatLng(x, y);
  return latLngToVector3(lat, lng, radius);
}

export function vector3ToPct(v: THREE.Vector3): [x: number, y: number] {
  const radius = v.length();
  const phi = Math.acos(THREE.MathUtils.clamp(v.y / radius, -1, 1));
  let theta = Math.atan2(v.z, -v.x);
  if (theta < 0) theta += 2 * Math.PI;
  const x = (theta / (2 * Math.PI)) * 100;
  const y = (phi / Math.PI) * 100;
  return [
    Math.round(x * 10) / 10,
    Math.round(y * 10) / 10,
  ];
}
