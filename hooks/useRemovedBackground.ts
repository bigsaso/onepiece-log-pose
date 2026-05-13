'use client';

import { useState, useEffect } from 'react';

const cache = new Map<string, string>();

function removeBackground(img: HTMLImageElement): string {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);

  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  function getPixel(x: number, y: number) {
    const i = (y * width + x) * 4;
    return [data[i], data[i + 1], data[i + 2], data[i + 3]] as [number, number, number, number];
  }

  const corners = [
    getPixel(0, 0),
    getPixel(width - 1, 0),
    getPixel(0, height - 1),
    getPixel(width - 1, height - 1),
  ];
  const bgR = Math.round(corners.reduce((s, c) => s + c[0], 0) / 4);
  const bgG = Math.round(corners.reduce((s, c) => s + c[1], 0) / 4);
  const bgB = Math.round(corners.reduce((s, c) => s + c[2], 0) / 4);

  const tolerance = 40;

  function isBg(i: number): boolean {
    return (
      data[i + 3] > 10 &&
      Math.abs(data[i] - bgR) < tolerance &&
      Math.abs(data[i + 1] - bgG) < tolerance &&
      Math.abs(data[i + 2] - bgB) < tolerance
    );
  }

  const visited = new Uint8Array(width * height);
  const queue: number[] = [];

  function enqueue(x: number, y: number) {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const idx = y * width + x;
    if (visited[idx]) return;
    const i = idx * 4;
    if (!isBg(i)) return;
    visited[idx] = 1;
    queue.push(x, y);
  }

  for (let x = 0; x < width; x++) { enqueue(x, 0); enqueue(x, height - 1); }
  for (let y = 0; y < height; y++) { enqueue(0, y); enqueue(width - 1, y); }

  while (queue.length > 0) {
    const y = queue.pop()!;
    const x = queue.pop()!;
    const i = (y * width + x) * 4;
    data[i + 3] = 0;
    enqueue(x + 1, y);
    enqueue(x - 1, y);
    enqueue(x, y + 1);
    enqueue(x, y - 1);
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}

export function useRemovedBackground(src: string): string {
  const [processed, setProcessed] = useState<string>(() => cache.get(src) ?? src);

  useEffect(() => {
    if (cache.has(src)) {
      setProcessed(cache.get(src)!);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const result = removeBackground(img);
        cache.set(src, result);
        setProcessed(result);
      } catch {
        cache.set(src, src);
        setProcessed(src);
      }
    };
    img.onerror = () => {
      cache.set(src, src);
      setProcessed(src);
    };
    img.src = src;
  }, [src]);

  return processed;
}
