'use client';

import * as THREE from 'three';
import { ARC_POSITIONS } from '../../data/coordinates';

const W = 4096;
const H = 2048;

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function drawNoise(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  alpha: number,
  seed: number,
) {
  const rng = mulberry32(seed);
  const imageData = ctx.getImageData(x, y, w, h);
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    const v = (rng() - 0.5) * 40;
    d[i] = Math.max(0, Math.min(255, d[i] + v));
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + v));
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + v));
    d[i + 3] = Math.max(0, Math.min(255, d[i + 3] * alpha + (255 * (1 - alpha))));
  }
  ctx.putImageData(imageData, x, y);
}

export function createMapTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#132d4a';
  ctx.fillRect(0, 0, W, H);

  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, 'rgba(5,15,30,0.6)');
  grad.addColorStop(0.3, 'rgba(5,15,30,0.1)');
  grad.addColorStop(0.5, 'rgba(30,80,120,0.15)');
  grad.addColorStop(0.7, 'rgba(5,15,30,0.1)');
  grad.addColorStop(1, 'rgba(5,15,30,0.6)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  const equatorY = H / 2;
  const grandLineHalfWidth = H * 0.06;
  const calmBeltWidth = H * 0.04;

  const calmUpperTop = equatorY - grandLineHalfWidth - calmBeltWidth;
  ctx.fillStyle = 'rgba(8,18,35,0.7)';
  ctx.fillRect(0, calmUpperTop, W, calmBeltWidth);

  const calmLowerTop = equatorY + grandLineHalfWidth;
  ctx.fillRect(0, calmLowerTop, W, calmBeltWidth);

  ctx.strokeStyle = 'rgba(15,30,50,0.5)';
  ctx.lineWidth = 1;
  for (let i = 0; i < W; i += 12) {
    ctx.beginPath();
    ctx.moveTo(i, calmUpperTop);
    ctx.lineTo(i + 6, calmUpperTop + calmBeltWidth);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(i, calmLowerTop);
    ctx.lineTo(i + 6, calmLowerTop + calmBeltWidth);
    ctx.stroke();
  }

  const glTop = equatorY - grandLineHalfWidth;
  const glGrad = ctx.createLinearGradient(0, glTop, 0, glTop + grandLineHalfWidth * 2);
  glGrad.addColorStop(0, 'rgba(35,75,110,0.4)');
  glGrad.addColorStop(0.5, 'rgba(44,93,128,0.5)');
  glGrad.addColorStop(1, 'rgba(35,75,110,0.4)');
  ctx.fillStyle = glGrad;
  ctx.fillRect(0, glTop, W, grandLineHalfWidth * 2);

  ctx.strokeStyle = 'rgba(200,154,58,0.6)';
  ctx.lineWidth = 2;
  ctx.setLineDash([20, 10]);
  ctx.beginPath();
  ctx.moveTo(0, glTop);
  ctx.lineTo(W, glTop);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, glTop + grandLineHalfWidth * 2);
  ctx.lineTo(W, glTop + grandLineHalfWidth * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  const redLineWidth = W * 0.025;

  function drawRedLine(centerX: number) {
    const rlGrad = ctx.createLinearGradient(
      centerX - redLineWidth,
      0,
      centerX + redLineWidth,
      0,
    );
    rlGrad.addColorStop(0, 'rgba(90,30,20,0.0)');
    rlGrad.addColorStop(0.15, 'rgba(120,45,30,0.9)');
    rlGrad.addColorStop(0.3, 'rgba(139,58,42,1)');
    rlGrad.addColorStop(0.5, 'rgba(160,70,50,1)');
    rlGrad.addColorStop(0.7, 'rgba(139,58,42,1)');
    rlGrad.addColorStop(0.85, 'rgba(120,45,30,0.9)');
    rlGrad.addColorStop(1, 'rgba(90,30,20,0.0)');
    ctx.fillStyle = rlGrad;
    ctx.fillRect(centerX - redLineWidth, 0, redLineWidth * 2, H);

    const rng = mulberry32(42);
    ctx.fillStyle = 'rgba(180,100,70,0.5)';
    for (let y = 0; y < H; y += 8) {
      const peakOffset = (rng() - 0.5) * redLineWidth * 0.6;
      const peakW = 4 + rng() * 8;
      const peakH = 3 + rng() * 6;
      ctx.fillRect(centerX + peakOffset - peakW / 2, y, peakW, peakH);
    }
  }

  drawRedLine(W / 2);
  drawRedLine(0);
  drawRedLine(W);

  ctx.font = 'bold 48px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const labelColor = 'rgba(123,168,196,0.35)';
  ctx.fillStyle = labelColor;

  ctx.fillText('N O R T H   B L U E', W * 0.25, H * 0.2);
  ctx.fillText('E A S T   B L U E', W * 0.75, H * 0.2);
  ctx.fillText('W E S T   B L U E', W * 0.25, H * 0.8);
  ctx.fillText('S O U T H   B L U E', W * 0.75, H * 0.8);

  ctx.font = 'bold 32px serif';
  ctx.fillStyle = 'rgba(200,154,58,0.4)';
  ctx.fillText('G R A N D   L I N E', W * 0.75, equatorY);
  ctx.fillText('N E W   W O R L D', W * 0.25, equatorY);

  for (const arc of ARC_POSITIONS) {
    const px = (arc.x / 100) * W;
    const py = (arc.y / 100) * H;

    ctx.beginPath();
    ctx.arc(px, py, 8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(90,130,80,0.8)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(60,90,50,0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(130,170,110,0.6)';
    ctx.fill();
  }

  ctx.fillStyle = 'rgba(200,180,140,0.04)';
  ctx.fillRect(0, 0, W, H);

  drawNoise(ctx, 0, 0, W, H, 1, 12345);

  drawCompassRose(ctx, W * 0.75, H * 0.65, 40);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function drawCompassRose(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = 'rgba(200,154,58,0.4)';
  ctx.fillStyle = 'rgba(200,154,58,0.3)';
  ctx.lineWidth = 1.5;

  const points = 4;
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    const outerX = Math.cos(angle) * size;
    const outerY = Math.sin(angle) * size;
    const leftAngle = angle - 0.15;
    const rightAngle = angle + 0.15;
    const innerDist = size * 0.3;
    ctx.moveTo(Math.cos(leftAngle) * innerDist, Math.sin(leftAngle) * innerDist);
    ctx.lineTo(outerX, outerY);
    ctx.lineTo(Math.cos(rightAngle) * innerDist, Math.sin(rightAngle) * innerDist);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.arc(0, 0, size * 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.font = 'bold 14px serif';
  ctx.fillStyle = 'rgba(200,154,58,0.5)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('N', 0, -size - 10);
  ctx.fillText('S', 0, size + 10);
  ctx.fillText('E', size + 10, 0);
  ctx.fillText('W', -size - 10, 0);

  ctx.restore();
}
