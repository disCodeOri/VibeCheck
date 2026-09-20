/**
 * 3D Garment Texture Generator & Synthesizer
 * Provides procedural fabric synthesis, image-to-texture tiling, and AI texture generation.
 */

export interface TexturePreset {
  id: string;
  name: string;
  category: 'denim' | 'plaid' | 'knit' | 'pattern' | 'leather' | 'linen';
  previewColor: string;
  generate: () => string; // returns data URL
}

/**
 * Creates a high-res canvas fabric texture
 */
function createCanvas(size = 512): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  return { canvas, ctx };
}

// 1. Japanese Selvedge Denim
export function generateDenimTexture(baseColor = '#1d3557', weftColor = '#ffffff'): string {
  const { canvas, ctx } = createCanvas(512);
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 512, 512);

  // Diagonal twill weave (2x1 right-hand twill)
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;

  for (let y = 0; y < 512; y++) {
    for (let x = 0; x < 512; x++) {
      const idx = (y * 512 + x) * 4;
      const twill = (x + y * 2) % 4 === 0;
      const noise = (Math.random() - 0.5) * 28;
      
      if (twill) {
        // Warp thread highlight
        data[idx] = Math.min(255, Math.max(0, data[idx] + 45 + noise));
        data[idx + 1] = Math.min(255, Math.max(0, data[idx + 1] + 45 + noise));
        data[idx + 2] = Math.min(255, Math.max(0, data[idx + 2] + 45 + noise));
      } else {
        // Weft indigo shade
        data[idx] = Math.min(255, Math.max(0, data[idx] + noise));
        data[idx + 1] = Math.min(255, Math.max(0, data[idx + 1] + noise));
        data[idx + 2] = Math.min(255, Math.max(0, data[idx + 2] + noise));
      }
    }
  }
  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL('image/png');
}

// 2. Tartan / Lumberjack Flannel Plaid
export function generatePlaidTexture(c1 = '#8b0000', c2 = '#1a1a1a', c3 = '#e6c229'): string {
  const { canvas, ctx } = createCanvas(512);
  ctx.fillStyle = c1;
  ctx.fillRect(0, 0, 512, 512);

  // Semi-transparent bands
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  for (let i = 0; i < 512; i += 128) {
    ctx.fillRect(i, 0, 64, 512);
    ctx.fillRect(0, i, 512, 64);
  }

  // Accent thin lines
  ctx.fillStyle = c3;
  ctx.globalAlpha = 0.85;
  for (let i = 32; i < 512; i += 128) {
    ctx.fillRect(i - 3, 0, 6, 512);
    ctx.fillRect(0, i - 3, 512, 6);
  }
  ctx.globalAlpha = 1.0;

  // Add subtle fabric fiber grain
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 18;
    d[i] = Math.min(255, Math.max(0, d[i] + n));
    d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + n));
    d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + n));
  }
  ctx.putImageData(imgData, 0, 0);

  return canvas.toDataURL('image/png');
}

// 3. Classic Houndstooth Weave
export function generateHoundstoothTexture(dark = '#12161f', light = '#f5f4ef'): string {
  const { canvas, ctx } = createCanvas(256);
  ctx.fillStyle = light;
  ctx.fillRect(0, 0, 256, 256);

  const step = 64;
  ctx.fillStyle = dark;

  for (let y = 0; y < 256; y += step) {
    for (let x = 0; x < 256; x += step) {
      const half = step / 2;
      ctx.beginPath();
      // Block top-left
      ctx.rect(x, y, half, half);
      // Triangle notch 1
      ctx.moveTo(x + half, y + half);
      ctx.lineTo(x + step, y);
      ctx.lineTo(x + step, y + half);
      // Triangle notch 2
      ctx.moveTo(x + half, y + half);
      ctx.lineTo(x, y + step);
      ctx.lineTo(x + half, y + step);
      ctx.fill();
    }
  }
  return canvas.toDataURL('image/png');
}

// 4. Ribbed Cable Knit
export function generateKnitTexture(baseColor = '#d9d2c5'): string {
  const { canvas, ctx } = createCanvas(512);
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 512, 512);

  const imgData = ctx.getImageData(0, 0, 512, 512);
  const d = imgData.data;
  const ribWidth = 32;

  for (let y = 0; y < 512; y++) {
    for (let x = 0; x < 512; x++) {
      const idx = (y * 512 + x) * 4;
      const xMod = x % ribWidth;
      const sinVal = Math.sin((xMod / ribWidth) * Math.PI);
      const wave = Math.cos((y / 8) * Math.PI) * 10;
      const shade = (sinVal - 0.5) * 55 + wave + (Math.random() - 0.5) * 15;

      d[idx] = Math.min(255, Math.max(0, d[idx] + shade));
      d[idx + 1] = Math.min(255, Math.max(0, d[idx + 1] + shade));
      d[idx + 2] = Math.min(255, Math.max(0, d[idx + 2] + shade));
    }
  }
  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL('image/png');
}

// 5. Raw Linen Fabric
export function generateLinenTexture(baseColor = '#e8dec8'): string {
  const { canvas, ctx } = createCanvas(512);
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 512, 512);

  const imgData = ctx.getImageData(0, 0, 512, 512);
  const d = imgData.data;

  for (let y = 0; y < 512; y++) {
    for (let x = 0; x < 512; x++) {
      const idx = (y * 512 + x) * 4;
      // Cross-weave slubs
      const horiz = y % 6 === 0 ? (Math.random() - 0.3) * 35 : 0;
      const vert = x % 6 === 0 ? (Math.random() - 0.3) * 35 : 0;
      const noise = (Math.random() - 0.5) * 20;
      const delta = horiz + vert + noise;

      d[idx] = Math.min(255, Math.max(0, d[idx] + delta));
      d[idx + 1] = Math.min(255, Math.max(0, d[idx + 1] + delta));
      d[idx + 2] = Math.min(255, Math.max(0, d[idx + 2] + delta));
    }
  }
  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL('image/png');
}

// 6. Cyberpunk Techwear Geometric Grid
export function generateTechwearTexture(baseColor = '#10141d', neon = '#00f0ff'): string {
  const { canvas, ctx } = createCanvas(512);
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 512, 512);

  // Hex grid pattern
  ctx.strokeStyle = '#222d3d';
  ctx.lineWidth = 2;
  const r = 24;
  const a = (2 * Math.PI) / 6;

  for (let y = 0; y < 550; y += r * 1.5) {
    const row = Math.floor(y / (r * 1.5));
    const xOffset = (row % 2) * (r * Math.sqrt(3) * 0.5);
    for (let x = -50; x < 550; x += r * Math.sqrt(3)) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const hx = x + xOffset + r * Math.cos(a * i);
        const hy = y + r * Math.sin(a * i);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.stroke();

      // Occasional neon node
      if (Math.sin(x * 12 + y * 7) > 0.82) {
        ctx.fillStyle = neon;
        ctx.shadowColor = neon;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(x + xOffset, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
  }

  return canvas.toDataURL('image/png');
}

// 7. Textured Leather
export function generateLeatherTexture(baseColor = '#2b1d14'): string {
  const { canvas, ctx } = createCanvas(512);
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 512, 512);

  const imgData = ctx.getImageData(0, 0, 512, 512);
  const d = imgData.data;

  // Voronoi-like cellular pebble noise
  for (let y = 0; y < 512; y++) {
    for (let x = 0; x < 512; x++) {
      const idx = (y * 512 + x) * 4;
      const grain = (Math.sin(x * 0.4) * Math.cos(y * 0.4) + Math.sin(x * 0.9 + y * 0.7)) * 14;
      const noise = (Math.random() - 0.5) * 18;
      const total = grain + noise;

      d[idx] = Math.min(255, Math.max(0, d[idx] + total));
      d[idx + 1] = Math.min(255, Math.max(0, d[idx + 1] + total * 0.8));
      d[idx + 2] = Math.min(255, Math.max(0, d[idx + 2] + total * 0.6));
    }
  }
  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL('image/png');
}

/**
 * Pre-curated Texture Swatches for 1-click swapping
 */
export const TEXTURE_PRESETS: TexturePreset[] = [
  {
    id: 'selvedge-denim',
    name: 'Selvedge Denim',
    category: 'denim',
    previewColor: '#1d3557',
    generate: () => generateDenimTexture('#1d3557', '#ffffff'),
  },
  {
    id: 'washed-black-denim',
    name: 'Washed Black Denim',
    category: 'denim',
    previewColor: '#2b2d30',
    generate: () => generateDenimTexture('#27292c', '#888888'),
  },
  {
    id: 'tartan-plaid',
    name: 'Tartan Flannel',
    category: 'plaid',
    previewColor: '#8b0000',
    generate: () => generatePlaidTexture('#8b0000', '#1a1a1a', '#e6c229'),
  },
  {
    id: 'green-navy-plaid',
    name: 'Black Watch Tartan',
    category: 'plaid',
    previewColor: '#1b3b2b',
    generate: () => generatePlaidTexture('#1b3b2b', '#10223d', '#22a06b'),
  },
  {
    id: 'houndstooth',
    name: 'Monochrome Houndstooth',
    category: 'pattern',
    previewColor: '#12161f',
    generate: () => generateHoundstoothTexture('#12161f', '#f5f4ef'),
  },
  {
    id: 'cable-knit',
    name: 'Cream Cable Knit',
    category: 'knit',
    previewColor: '#ded8cc',
    generate: () => generateKnitTexture('#ded8cc'),
  },
  {
    id: 'natural-linen',
    name: 'Natural Oatmeal Linen',
    category: 'linen',
    previewColor: '#e0d5be',
    generate: () => generateLinenTexture('#e0d5be'),
  },
  {
    id: 'cognac-leather',
    name: 'Cognac Leather',
    category: 'leather',
    previewColor: '#3d2516',
    generate: () => generateLeatherTexture('#3d2516'),
  },
  {
    id: 'techwear-grid',
    name: 'Cyberpunk Hex Grid',
    category: 'pattern',
    previewColor: '#10141d',
    generate: () => generateTechwearTexture('#10141d', '#00f0ff'),
  },
];

/**
 * Turns an uploaded garment image into a seamless repeating texture tile
 */
export async function imageToSeamlessTexture(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const { canvas, ctx } = createCanvas(512);
      // Center crop square
      const s = Math.min(img.width, img.height);
      const sx = (img.width - s) / 2;
      const sy = (img.height - s) / 2;
      
      // Draw 2x2 mirrored tile to guarantee seamlessness
      const half = 256;
      ctx.drawImage(img, sx, sy, s, s, 0, 0, half, half);
      
      // Flip X
      ctx.save();
      ctx.translate(512, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, sx, sy, s, s, 0, 0, half, half);
      ctx.restore();

      // Flip Y
      ctx.save();
      ctx.translate(0, 512);
      ctx.scale(1, -1);
      ctx.drawImage(img, sx, sy, s, s, 0, 0, half, half);
      ctx.restore();

      // Flip XY
      ctx.save();
      ctx.translate(512, 512);
      ctx.scale(-1, -1);
      ctx.drawImage(img, sx, sy, s, s, 0, 0, half, half);
      ctx.restore();

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('Failed to load image for texture processing'));
    img.src = dataUrl;
  });
}
