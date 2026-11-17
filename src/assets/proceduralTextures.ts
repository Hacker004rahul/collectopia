import * as THREE from 'three';
import type { GateSpec } from '../economy/gateMath';

export const SIGN_ATLAS_COLUMNS = 4;
export const SIGN_ATLAS_ROWS = 4;

export const SIGN_CELLS = {
  kirana: 0,
  generalStore: 1,
  chai: 2,
  sweets: 3,
  medical: 4,
  tailor: 5,
  salon: 6,
  electricals: 7,
  vegetables: 8,
  temple: 9,
  repair: 10,
  school: 11,
  noHorn: 12,
  society: 13,
  dairy: 14,
  mobile: 15,
} as const;

function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvasTexture(
  canvas: HTMLCanvasElement,
  options: {
    repeat?: [number, number];
    clamp?: boolean;
    colorSpace?: THREE.ColorSpace;
    anisotropy?: number;
  } = {},
): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas);
  const repeat = options.repeat ?? [1, 1];
  texture.wrapS = options.clamp ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
  texture.wrapT = options.clamp ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
  texture.repeat.set(repeat[0], repeat[1]);
  texture.colorSpace = options.colorSpace ?? THREE.SRGBColorSpace;
  texture.anisotropy = options.anisotropy ?? 4;
  return texture;
}

function makeCanvas(width: number, height: number): {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
} {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create a procedural texture canvas');
  return { canvas, ctx };
}

function addGrain(
  ctx: CanvasRenderingContext2D,
  random: () => number,
  width: number,
  height: number,
  count: number,
  minAlpha: number,
  maxAlpha: number,
): void {
  for (let i = 0; i < count; i += 1) {
    const shade = Math.floor(40 + random() * 120);
    ctx.fillStyle = `rgba(${shade}, ${shade}, ${shade}, ${
      minAlpha + random() * (maxAlpha - minAlpha)
    })`;
    const size = 0.5 + random() * 3.5;
    ctx.fillRect(random() * width, random() * height, size, size);
  }
}

function addCracks(
  ctx: CanvasRenderingContext2D,
  random: () => number,
  width: number,
  height: number,
  count: number,
  color: string,
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  for (let i = 0; i < count; i += 1) {
    let x = random() * width;
    let y = random() * height;
    ctx.beginPath();
    ctx.moveTo(x, y);
    const steps = 3 + Math.floor(random() * 5);
    for (let step = 0; step < steps; step += 1) {
      x += (random() - 0.5) * 26;
      y += 7 + random() * 20;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

export function createAsphaltTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = makeCanvas(512, 512);
  const random = seeded(0xa5fa17);

  ctx.fillStyle = '#3d4249';
  ctx.fillRect(0, 0, 512, 512);

  addGrain(ctx, random, 512, 512, 5600, 0.025, 0.13);

  for (let i = 0; i < 22; i += 1) {
    const x = random() * 512;
    const y = random() * 512;
    const radiusX = 18 + random() * 90;
    const radiusY = 6 + random() * 28;
    ctx.fillStyle = `rgba(24, 27, 31, ${0.05 + random() * 0.12})`;
    ctx.beginPath();
    ctx.ellipse(x, y, radiusX, radiusY, random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 12; i += 1) {
    const x = random() * 512;
    const y = random() * 512;
    const width = 24 + random() * 100;
    const height = 12 + random() * 48;
    ctx.fillStyle = `rgba(88, 91, 94, ${0.06 + random() * 0.08})`;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 5);
    ctx.fill();
    ctx.strokeStyle = 'rgba(25, 27, 30, 0.22)';
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(20, 22, 25, 0.5)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 9; i += 1) {
    let x = random() * 512;
    let y = random() * 512;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let step = 0; step < 6; step += 1) {
      x += (random() - 0.5) * 34;
      y += 10 + random() * 26;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  const sheen = ctx.createLinearGradient(0, 0, 512, 0);
  sheen.addColorStop(0, 'rgba(255, 255, 255, 0)');
  sheen.addColorStop(0.5, 'rgba(255, 255, 255, 0.025)');
  sheen.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, 512, 512);

  return canvasTexture(canvas);
}

export function createPaverTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = makeCanvas(512, 512);
  const random = seeded(0x9a71e1);

  ctx.fillStyle = '#8b8173';
  ctx.fillRect(0, 0, 512, 512);

  const rowHeight = 64;
  const paverWidth = 126;
  for (let row = 0; row < 8; row += 1) {
    const offset = row % 2 === 0 ? -63 : 0;
    for (let x = offset; x < 512; x += paverWidth) {
      const shade = 158 + Math.floor(random() * 30);
      ctx.fillStyle = `rgb(${shade + 8}, ${shade + 2}, ${shade - 9})`;
      ctx.fillRect(x + 3, row * rowHeight + 3, paverWidth - 6, rowHeight - 6);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(x + 6, row * rowHeight + 6, paverWidth - 12, 4);
      ctx.fillStyle = 'rgba(51, 45, 38, 0.08)';
      ctx.fillRect(x + 6, row * rowHeight + rowHeight - 13, paverWidth - 12, 4);
    }
  }

  addGrain(ctx, random, 512, 512, 1700, 0.015, 0.075);

  for (let i = 0; i < 10; i += 1) {
    ctx.fillStyle = `rgba(39, 45, 34, ${0.03 + random() * 0.07})`;
    ctx.beginPath();
    ctx.ellipse(
      random() * 512,
      random() * 512,
      14 + random() * 60,
      6 + random() * 22,
      random() * Math.PI,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  return canvasTexture(canvas);
}

export function createPlasterTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = makeCanvas(256, 256);
  const random = seeded(0x4f1a2b);

  ctx.fillStyle = '#f3efe8';
  ctx.fillRect(0, 0, 256, 256);
  addGrain(ctx, random, 256, 256, 2400, 0.012, 0.07);

  for (let i = 0; i < 18; i += 1) {
    ctx.fillStyle = `rgba(120, 108, 91, ${0.02 + random() * 0.05})`;
    ctx.beginPath();
    ctx.ellipse(
      random() * 256,
      random() * 256,
      8 + random() * 34,
      4 + random() * 18,
      random() * Math.PI,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  addCracks(ctx, random, 256, 256, 4, 'rgba(93, 84, 71, 0.2)');

  const drips = ctx.createLinearGradient(0, 190, 0, 256);
  drips.addColorStop(0, 'rgba(99, 89, 73, 0)');
  drips.addColorStop(1, 'rgba(99, 89, 73, 0.08)');
  ctx.fillStyle = drips;
  ctx.fillRect(0, 190, 256, 66);

  return canvasTexture(canvas);
}

export function createBrickTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = makeCanvas(256, 256);
  const random = seeded(0x0b21c4);

  ctx.fillStyle = '#d9d2c7';
  ctx.fillRect(0, 0, 256, 256);

  const brickHeight = 32;
  const brickWidth = 64;
  for (let row = 0; row < 8; row += 1) {
    const offset = row % 2 === 0 ? -32 : 0;
    for (let x = offset; x < 256; x += brickWidth) {
      const shade = 176 + Math.floor(random() * 48);
      ctx.fillStyle = `rgb(${shade}, ${shade - 10}, ${shade - 22})`;
      ctx.fillRect(x + 2, row * brickHeight + 2, brickWidth - 4, brickHeight - 4);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.fillRect(x + 4, row * brickHeight + 4, brickWidth - 8, 2);
    }
  }

  addGrain(ctx, random, 256, 256, 900, 0.015, 0.09);
  addCracks(ctx, random, 256, 256, 2, 'rgba(72, 61, 50, 0.16)');

  return canvasTexture(canvas);
}

export function createConcreteTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = makeCanvas(256, 256);
  const random = seeded(0xc0c2e7);

  ctx.fillStyle = '#d8d4cc';
  ctx.fillRect(0, 0, 256, 256);
  addGrain(ctx, random, 256, 256, 2600, 0.015, 0.08);

  for (let i = 0; i < 14; i += 1) {
    ctx.fillStyle = `rgba(91, 88, 82, ${0.025 + random() * 0.045})`;
    ctx.beginPath();
    ctx.ellipse(
      random() * 256,
      random() * 256,
      8 + random() * 32,
      4 + random() * 14,
      random() * Math.PI,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  ctx.strokeStyle = 'rgba(101, 97, 89, 0.16)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i += 1) {
    const y = random() * 256;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y + (random() - 0.5) * 5);
    ctx.stroke();
  }

  return canvasTexture(canvas);
}

export function createRoofTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = makeCanvas(256, 256);
  const random = seeded(0x52ee91);

  ctx.fillStyle = '#b8aa99';
  ctx.fillRect(0, 0, 256, 256);

  const rowHeight = 32;
  for (let row = 0; row < 8; row += 1) {
    const offset = row % 2 === 0 ? -22 : 0;
    for (let x = offset; x < 256; x += 44) {
      const shade = 162 + Math.floor(random() * 50);
      ctx.fillStyle = `rgb(${shade + 6}, ${shade - 3}, ${shade - 15})`;
      ctx.beginPath();
      ctx.roundRect(x + 2, row * rowHeight + 3, 40, rowHeight - 3, [10, 10, 3, 3]);
      ctx.fill();
      ctx.strokeStyle = 'rgba(70, 55, 43, 0.2)';
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.11)';
      ctx.fillRect(x + 7, row * rowHeight + 6, 30, 3);
    }
  }

  addGrain(ctx, random, 256, 256, 1000, 0.015, 0.08);
  return canvasTexture(canvas);
}

export function createWoodTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = makeCanvas(128, 256);
  const random = seeded(0x7a11d3);
  ctx.fillStyle = '#b48a5d';
  ctx.fillRect(0, 0, 128, 256);

  for (let plank = 0; plank < 4; plank += 1) {
    const x = plank * 32;
    ctx.fillStyle = 'rgba(60, 34, 17, 0.22)';
    ctx.fillRect(x, 0, 2, 256);
    for (let line = 0; line < 7; line += 1) {
      ctx.strokeStyle = `rgba(73, 43, 22, ${0.05 + random() * 0.1})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      const lineX = x + 7 + random() * 20;
      ctx.moveTo(lineX, 0);
      for (let y = 0; y <= 256; y += 32) {
        ctx.lineTo(lineX + Math.sin(y * 0.04 + plank) * 3 + (random() - 0.5) * 2, y);
      }
      ctx.stroke();
    }
  }

  addGrain(ctx, random, 128, 256, 700, 0.02, 0.09);
  return canvasTexture(canvas);
}

export function createDirtTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = makeCanvas(256, 256);
  const random = seeded(0xd147c0);

  ctx.fillStyle = '#96865e';
  ctx.fillRect(0, 0, 256, 256);
  addGrain(ctx, random, 256, 256, 3200, 0.02, 0.1);

  for (let i = 0; i < 54; i += 1) {
    const shade = 105 + Math.floor(random() * 60);
    ctx.fillStyle = `rgba(${shade + 15}, ${shade + 7}, ${shade - 18}, 0.2)`;
    ctx.beginPath();
    ctx.arc(random() * 256, random() * 256, 1 + random() * 5, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 9; i += 1) {
    ctx.fillStyle = `rgba(78, 88, 46, ${0.05 + random() * 0.1})`;
    ctx.beginPath();
    ctx.ellipse(
      random() * 256,
      random() * 256,
      10 + random() * 36,
      5 + random() * 18,
      random() * Math.PI,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  return canvasTexture(canvas);
}

const SIGN_LABELS = [
  ['KIRANA', 'STORE'],
  ['SHARMA', 'GENERAL STORE'],
  ['CHAI', '& SNACKS'],
  ['SWEETS', '& NAMKEEN'],
  ['MEDICAL', 'STORE'],
  ['TAILOR', 'MASTER'],
  ['SALON', 'UNISEX'],
  ['ELECTRICALS'],
  ['SABZI', 'MANDI'],
  ['OM', 'SHANTI'],
  ['SCOOTER', 'REPAIR'],
  ['SCHOOL', 'AHEAD'],
  ['NO', 'HORN'],
  ['SOCIETY', 'PARK'],
  ['FRESH', 'DAIRY'],
  ['MOBILE', 'REPAIR'],
] as const;

const SIGN_COLORS = [
  ['#bf3d2f', '#fff4df'],
  ['#1f6b58', '#fff8e2'],
  ['#d79022', '#231a0f'],
  ['#a53139', '#fff4df'],
  ['#226487', '#fff4df'],
  ['#633b7c', '#fff4df'],
  ['#b3437d', '#fff4df'],
  ['#31558d', '#fff4df'],
  ['#42752f', '#fff4df'],
  ['#b94b29', '#fff4df'],
  ['#2d3d55', '#ffdd85'],
  ['#ede2c4', '#374657'],
  ['#e8e2cf', '#b12a27'],
  ['#2c6950', '#fff4df'],
  ['#d7e3ec', '#275570'],
  ['#404247', '#ffde72'],
] as const;

function drawSignCell(
  ctx: CanvasRenderingContext2D,
  index: number,
  random: () => number,
): void {
  const cell = 256;
  const columns = 4;
  const col = index % columns;
  const row = Math.floor(index / columns);
  const x = col * cell;
  const y = row * cell;
  const [background, foreground] = SIGN_COLORS[index];
  const labels = SIGN_LABELS[index];

  ctx.fillStyle = background;
  ctx.fillRect(x, y, cell, cell);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.lineWidth = 6;
  ctx.strokeRect(x + 8, y + 8, cell - 16, cell - 16);

  ctx.strokeStyle = 'rgba(0, 0, 0, 0.18)';
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 13, y + 13, cell - 26, cell - 26);

  ctx.fillStyle = foreground;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const longest = Math.max(...labels.map((label) => label.length));
  const fontSize = longest > 11 ? 30 : longest > 7 ? 39 : 48;
  ctx.font = `900 ${fontSize}px "Arial Narrow", "Segoe UI", sans-serif`;

  if (labels.length === 1) {
    ctx.fillText(labels[0], x + cell / 2, y + cell / 2 + 2);
  } else {
    ctx.fillText(labels[0], x + cell / 2, y + cell / 2 - fontSize * 0.62);
    ctx.fillText(labels[1], x + cell / 2, y + cell / 2 + fontSize * 0.62);
  }

  for (let i = 0; i < 28; i += 1) {
    ctx.fillStyle = `rgba(0, 0, 0, ${random() * 0.07})`;
    ctx.fillRect(x + random() * cell, y + random() * cell, 1 + random() * 3, 1 + random() * 3);
  }

  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.fillRect(x, y, cell, 4);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
  ctx.fillRect(x, y + cell - 4, cell, 4);
}

export function createSignAtlasTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = makeCanvas(1024, 1024);
  const random = seeded(0x51a9c2);

  for (let index = 0; index < SIGN_ATLAS_COLUMNS * SIGN_ATLAS_ROWS; index += 1) {
    drawSignCell(ctx, index, random);
  }

  ctx.fillStyle = 'rgba(29, 33, 31, 0.28)';
  for (let i = 0; i <= SIGN_ATLAS_COLUMNS; i += 1) {
    ctx.fillRect(i * 256 - 2, 0, 4, 1024);
  }
  for (let i = 0; i <= SIGN_ATLAS_ROWS; i += 1) {
    ctx.fillRect(0, i * 256 - 2, 1024, 4);
  }

  return canvasTexture(canvas, { clamp: true, anisotropy: 8 });
}

export function createContactShadowTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = makeCanvas(128, 128);
  const gradient = ctx.createRadialGradient(64, 64, 6, 64, 64, 62);
  gradient.addColorStop(0, 'rgba(14, 18, 17, 0.55)');
  gradient.addColorStop(0.45, 'rgba(14, 18, 17, 0.3)');
  gradient.addColorStop(1, 'rgba(14, 18, 17, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  return canvasTexture(canvas, {
    clamp: true,
    colorSpace: THREE.NoColorSpace,
    anisotropy: 1,
  });
}

export function createCloudTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = makeCanvas(256, 128);
  const random = seeded(0xc10d5);
  for (let i = 0; i < 18; i += 1) {
    const x = 36 + random() * 184;
    const y = 42 + random() * 50;
    const radius = 18 + random() * 38;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.62)');
    gradient.addColorStop(0.6, 'rgba(255, 250, 240, 0.32)');
    gradient.addColorStop(1, 'rgba(255, 250, 240, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  return canvasTexture(canvas, { clamp: true, anisotropy: 1 });
}

export function createRoadTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = makeCanvas(512, 1024);
  const random = seeded(0x0ad5eed);
  ctx.fillStyle = '#3c4048';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  addGrain(ctx, random, canvas.width, canvas.height, 4500, 0.02, 0.12);
  addCracks(ctx, random, canvas.width, canvas.height, 6, 'rgba(20, 22, 26, 0.35)');

  ctx.fillStyle = 'rgba(238, 228, 200, 0.78)';
  ctx.fillRect(28, 0, 7, canvas.height);
  ctx.fillRect(canvas.width - 35, 0, 7, canvas.height);

  ctx.fillStyle = 'rgba(244, 238, 218, 0.62)';
  for (const x of [canvas.width / 3, (canvas.width * 2) / 3]) {
    for (let y = -40; y < canvas.height + 40; y += 150) {
      ctx.fillRect(x - 4, y, 8, 78);
    }
  }

  return canvasTexture(canvas, { repeat: [1, 2] });
}

export function createGlowTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = makeCanvas(128, 128);

  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.22, 'rgba(255, 243, 194, 0.9)');
  gradient.addColorStop(0.55, 'rgba(255, 207, 92, 0.35)');
  gradient.addColorStop(1, 'rgba(255, 190, 50, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  return canvasTexture(canvas, { clamp: true });
}

const gateTextureCache = new Map<string, THREE.CanvasTexture>();

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function colorWithAlpha(hex: string, alpha: number): string {
  const value = hex.replace('#', '');
  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function createGateTexture(spec: GateSpec): THREE.CanvasTexture {
  const cacheKey = `${spec.operation}:${spec.value}:${spec.color}`;
  const cached = gateTextureCache.get(cacheKey);
  if (cached) return cached;

  const width = 512;
  const height = 300;
  const { canvas, ctx } = makeCanvas(width, height);

  const panelX = 10;
  const panelY = 10;
  const panelWidth = width - 20;
  const panelHeight = height - 20;
  const panelRadius = 30;

  ctx.save();
  roundedRect(ctx, panelX, panelY, panelWidth, panelHeight, panelRadius);
  ctx.clip();

  const glass = ctx.createLinearGradient(0, panelY, 0, height - panelY);
  glass.addColorStop(0, '#223047');
  glass.addColorStop(0.48, '#111a2a');
  glass.addColorStop(1, '#070b13');
  ctx.fillStyle = glass;
  ctx.fillRect(0, 0, width, height);

  const glow = ctx.createRadialGradient(
    width / 2,
    176,
    8,
    width / 2,
    176,
    208,
  );
  glow.addColorStop(0, colorWithAlpha(spec.color, 0.3));
  glow.addColorStop(0.52, colorWithAlpha(spec.color, 0.08));
  glow.addColorStop(1, colorWithAlpha(spec.color, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  const sheen = ctx.createLinearGradient(36, 18, 460, 282);
  sheen.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
  sheen.addColorStop(0.32, 'rgba(255, 255, 255, 0.035)');
  sheen.addColorStop(0.68, 'rgba(255, 255, 255, 0)');
  sheen.addColorStop(1, 'rgba(255, 255, 255, 0.07)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.beginPath();
  ctx.moveTo(44, 18);
  ctx.lineTo(148, 18);
  ctx.lineTo(72, 284);
  ctx.lineTo(18, 284);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(0, 0, 0, 0.24)';
  ctx.fillRect(18, 260, width - 36, 32);
  ctx.restore();

  const outerTrim = ctx.createLinearGradient(0, 0, width, height);
  outerTrim.addColorStop(0, '#fff0c7');
  outerTrim.addColorStop(0.24, '#d8bf8a');
  outerTrim.addColorStop(0.55, '#a98045');
  outerTrim.addColorStop(0.78, '#f3dda8');
  outerTrim.addColorStop(1, '#8b6434');

  roundedRect(ctx, 11, 11, width - 22, height - 22, 29);
  ctx.strokeStyle = 'rgba(5, 8, 14, 0.9)';
  ctx.lineWidth = 7;
  ctx.stroke();

  roundedRect(ctx, 15, 15, width - 30, height - 30, 26);
  ctx.strokeStyle = outerTrim;
  ctx.lineWidth = 4;
  ctx.stroke();

  roundedRect(ctx, 20, 20, width - 40, height - 40, 22);
  ctx.strokeStyle = 'rgba(255, 243, 205, 0.62)';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  roundedRect(ctx, 25, 25, width - 50, height - 50, 19);
  ctx.strokeStyle = colorWithAlpha(spec.color, 0.72);
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.strokeStyle = colorWithAlpha(spec.color, 0.25);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(38, 88);
  ctx.lineTo(width - 38, 88);
  ctx.stroke();

  for (const [studX, studY] of [
    [32, 32],
    [width - 32, 32],
    [32, height - 32],
    [width - 32, height - 32],
  ] as const) {
    const stud = ctx.createRadialGradient(
      studX - 1,
      studY - 1,
      0,
      studX,
      studY,
      5,
    );
    stud.addColorStop(0, '#fff6d8');
    stud.addColorStop(0.5, '#c9a768');
    stud.addColorStop(1, '#6f4f26');
    ctx.fillStyle = stud;
    ctx.beginPath();
    ctx.arc(studX, studY, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.beginPath();
  ctx.arc(width / 2, 57, 24, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(5, 9, 16, 0.6)';
  ctx.fill();
  ctx.strokeStyle = colorWithAlpha(spec.color, 0.85);
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 238, 191, 0.52)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(width / 2, 57, 20, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = spec.color;
  ctx.font = '800 25px "Segoe UI", system-ui, sans-serif';
  ctx.shadowColor = colorWithAlpha(spec.color, 0.75);
  ctx.shadowBlur = 12;
  ctx.fillText(spec.symbol, width / 2, 58);
  ctx.shadowBlur = 0;

  const valueGradient = ctx.createLinearGradient(0, 98, 0, 238);
  valueGradient.addColorStop(0, '#ffffff');
  valueGradient.addColorStop(0.58, '#f8f2e4');
  valueGradient.addColorStop(1, spec.color);
  ctx.fillStyle = valueGradient;
  ctx.shadowColor = colorWithAlpha(spec.color, 0.62);
  ctx.shadowBlur = 22;
  ctx.shadowOffsetY = 4;

  let fontSize = 124;
  const value = `${spec.symbol}${spec.value}`;
  do {
    ctx.font = `900 ${fontSize}px "Segoe UI", system-ui, sans-serif`;
    fontSize -= 6;
  } while (ctx.measureText(value).width > 414 && fontSize > 76);
  ctx.fillText(value, width / 2, 174);
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  ctx.strokeStyle = 'rgba(255, 236, 184, 0.55)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(178, 244);
  ctx.lineTo(236, 244);
  ctx.moveTo(width - 178, 244);
  ctx.lineTo(width - 236, 244);
  ctx.stroke();

  ctx.fillStyle = colorWithAlpha(spec.color, 0.9);
  ctx.beginPath();
  ctx.moveTo(width / 2, 237);
  ctx.lineTo(width / 2 + 7, 244);
  ctx.lineTo(width / 2, 251);
  ctx.lineTo(width / 2 - 7, 244);
  ctx.closePath();
  ctx.fill();

  const texture = canvasTexture(canvas, { clamp: true });
  gateTextureCache.set(cacheKey, texture);
  return texture;
}
