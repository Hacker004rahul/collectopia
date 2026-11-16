/**
 * Printed advertising textures.
 *
 * The Spryntworks artwork is always loaded from the original JPG and drawn
 * proportionally into the print layout; it is never recreated or stretched.
 */
import * as THREE from 'three';

let logoTexture: THREE.Texture | null = null;
let logoLoading = false;
let printedTexture: THREE.CanvasTexture | null = null;
const logoCallbacks: Array<(texture: THREE.Texture) => void> = [];

export function getSpryntworksLogo(
  callback: (texture: THREE.Texture) => void,
): void {
  if (logoTexture) {
    callback(logoTexture);
    return;
  }
  logoCallbacks.push(callback);
  if (logoLoading) return;
  logoLoading = true;

  new THREE.TextureLoader().load(
    '/assets/branding/spryntworks-logo.jpg',
    (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = true;
      texture.anisotropy = 8;
      logoTexture = texture;
      for (const cb of logoCallbacks) cb(texture);
      logoCallbacks.length = 0;
    },
    undefined,
    (error) => {
      console.error('Failed to load the original Spryntworks logo artwork', error);
      logoLoading = false;
      logoCallbacks.length = 0;
    },
  );
}

export function disposeLogo(): void {
  logoTexture?.dispose();
  printedTexture?.dispose();
  for (const t of logoBillboardTextures) t.dispose();
  logoBillboardTextures.length = 0;
  logoTexture = null;
  printedTexture = null;
  logoLoading = false;
  logoCallbacks.length = 0;
}

function makeCanvas(w: number, h: number): {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
} {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Unable to create the advertising texture canvas');
  return { canvas, ctx };
}

function canvasTex(canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = 8;
  return texture;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function paintPrintedBillboard(
  ctx: CanvasRenderingContext2D,
  image?: CanvasImageSource,
): void {
  const width = 2400;
  const height = 1024;
  ctx.fillStyle = '#f6f3eb';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#c51e82';
  ctx.fillRect(0, 0, width, 28);
  ctx.fillStyle = '#172033';
  ctx.fillRect(0, 852, width, 172);

  ctx.fillStyle = '#ffffff';
  roundRect(ctx, 72, 198, 880, 400, 18);
  ctx.fill();
  ctx.strokeStyle = '#dedbd3';
  ctx.lineWidth = 5;
  roundRect(ctx, 74, 200, 876, 396, 18);
  ctx.stroke();

  if (image) {
    const logoAspect = 640 / 271;
    const logoWidth = 820;
    const logoHeight = logoWidth / logoAspect;
    ctx.drawImage(
      image,
      102,
      216 + (364 - logoHeight) / 2,
      logoWidth,
      logoHeight,
    );
  }

  ctx.fillStyle = '#c51e82';
  ctx.fillRect(1010, 198, 12, 400);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#172033';
  ctx.font = '800 132px system-ui, sans-serif';
  ctx.fillText('RUN. EARN.', 1090, 370);
  ctx.fillText('COLLECT.', 1090, 520);
  ctx.fillStyle = '#c51e82';
  ctx.fillRect(1092, 566, 460, 12);

  ctx.fillStyle = '#ffffff';
  ctx.font = '600 58px system-ui, sans-serif';
  ctx.fillText('YOUR NEXT STEP PAYS OFF', 92, 958);
  ctx.textAlign = 'right';
  ctx.font = '600 54px system-ui, sans-serif';
  ctx.fillText('SPRYNTWORKS.COM', 2300, 958);
}

/**
 * A high-resolution, opaque printed layout shared by roadside hoardings and
 * highway gantries. The logo's original 640:271 aspect ratio is preserved.
 */
export function makePrintedBillboardTexture(): THREE.CanvasTexture {
  if (printedTexture) return printedTexture;

  const { canvas, ctx } = makeCanvas(2400, 1024);
  paintPrintedBillboard(ctx);
  const textureResult = canvasTex(canvas);
  printedTexture = textureResult;

  getSpryntworksLogo((texture) => {
    paintPrintedBillboard(ctx, texture.image as CanvasImageSource);
    textureResult.needsUpdate = true;
  });
  return textureResult;
}

export function makeBuildingBoardTexture(accentHex: string): THREE.CanvasTexture {
  const { canvas, ctx } = makeCanvas(512, 256);
  ctx.fillStyle = '#f5f0e8';
  ctx.fillRect(0, 0, 512, 256);
  ctx.fillStyle = accentHex;
  ctx.fillRect(0, 0, 512, 20);
  ctx.fillRect(0, 236, 512, 20);
  ctx.strokeStyle = accentHex;
  ctx.lineWidth = 5;
  ctx.strokeRect(5, 5, 502, 246);
  return canvasTex(canvas);
}

export function makeShopfrontBoardTexture(
  bgHex: string,
  textLine: string,
): THREE.CanvasTexture {
  const { canvas, ctx } = makeCanvas(512, 160);
  ctx.fillStyle = bgHex;
  ctx.fillRect(0, 0, 512, 160);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 42px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SPRYNTWORKS', 256, 72);
  ctx.font = '26px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.fillText(textLine, 256, 120);
  return canvasTex(canvas);
}

/**
 * Full-frame logo billboard.
 * The logo fills the entire panel face — dark bg, logo scaled to fill,
 * thin border. No taglines or decorations eating into logo space.
 */
const logoBillboardTextures: THREE.CanvasTexture[] = [];

function paintLogoBillboard(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  logo?: CanvasImageSource,
): void {
  // Full-bleed dark bg
  ctx.fillStyle = '#0e1228';
  ctx.fillRect(0, 0, W, H);

  if (logo) {
    // Draw logo to fill 100% of the canvas — no padding at all
    ctx.drawImage(logo, 0, 0, W, H);
  } else {
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = `bold ${Math.round(H * 0.22)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('COLLECTOPIA', W / 2, H / 2);
  }
}

export function makeLogoBillboardTexture(panelW = 3.2, panelH = 3.0): THREE.CanvasTexture {
  // Canvas always matches the logo's native 640:271 aspect so it fills
  // the panel without distortion. The 3D plane is sized to the panel dims.
  const W = 1024;
  const H = Math.round(W * (271 / 640)); // 433 px — logo's own ratio
  const { canvas, ctx } = makeCanvas(W, H);
  paintLogoBillboard(ctx, W, H);
  const tex = canvasTex(canvas);
  logoBillboardTextures.push(tex);
  getSpryntworksLogo((texture) => {
    paintLogoBillboard(ctx, W, H, texture.image as CanvasImageSource);
    tex.needsUpdate = true;
  });
  // suppress unused-param lint — panel dims kept for caller clarity
  void panelW; void panelH;
  return tex;
}

export function makePlinthTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = makeCanvas(256, 128);
  const grad = ctx.createLinearGradient(0, 0, 0, 128);
  grad.addColorStop(0, '#2a2a2e');
  grad.addColorStop(0.5, '#3c3c42');
  grad.addColorStop(1, '#1a1a1e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 128);
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(0, 0, 256, 6);
  return canvasTex(canvas);
}
