/**
 * Real-time 3D Humanoid Face Texture Compositor
 * Uses OpenCV backend face detection & Poisson blending for perfect landmark alignment,
 * with seamless client-side canvas fallback.
 */

import { api } from './api';

export interface FaceCompositeOptions {
  userImageSrc: string;
  isMale?: boolean;
}

/**
 * Composites a user face image onto the Ready Player Me head UV texture.
 * Tries the OpenCV backend first for precise facial landmark detection and skin cloning.
 */
export async function createCompositedFaceTexture(
  options: FaceCompositeOptions
): Promise<string> {
  const { userImageSrc, isMale = false } = options;

  // 1. Try OpenCV Backend Pipeline (Haar Cascades + Poisson seamlessClone)
  try {
    const res = await api.alignFace({
      image: userImageSrc,
      isMale
    });
    if (res && res.success && res.faceTexture) {
      return res.faceTexture;
    }
  } catch (err) {
    console.warn('Backend OpenCV face align failed or server offline, using client fallback:', err);
  }

  // 2. Client-side Canvas Fallback
  return fallbackClientComposite(userImageSrc, isMale);
}

function fallbackClientComposite(userImageSrc: string, isMale: boolean): Promise<string> {
  const baseSkinUrl = isMale ? '/models/male_face.jpg' : '/models/female_face.png';

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return reject(new Error('Canvas 2D context unavailable'));
    }

    const baseImg = new Image();
    baseImg.crossOrigin = 'anonymous';

    baseImg.onload = () => {
      ctx.drawImage(baseImg, 0, 0, 512, 512);

      const userImg = new Image();
      userImg.crossOrigin = 'anonymous';

      userImg.onload = () => {
        const faceCanvas = document.createElement('canvas');
        faceCanvas.width = 512;
        faceCanvas.height = 512;
        const fCtx = faceCanvas.getContext('2d');
        if (!fCtx) {
          return resolve(canvas.toDataURL('image/jpeg', 0.95));
        }

        // Center on detected Ready Player Me face coordinates
        const cx = 254;
        const cy = 184;
        const rx = 100;
        const ry = 115;

        fCtx.save();
        const uAspect = userImg.width / userImg.height;
        const targetW = rx * 2.1;
        const targetH = ry * 2.1;
        let dw = targetW;
        let dh = targetH;
        let dx = cx - targetW / 2;
        let dy = cy - targetH / 2;

        if (uAspect > targetW / targetH) {
          dw = targetH * uAspect;
          dx = cx - dw / 2;
        } else {
          dh = targetW / uAspect;
          dy = cy - dh / 2;
        }

        fCtx.drawImage(userImg, dx, dy, dw, dh);

        // Radial feathering mask
        fCtx.globalCompositeOperation = 'destination-in';
        const gradient = fCtx.createRadialGradient(cx, cy, rx * 0.45, cx, cy, rx * 1.08);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
        gradient.addColorStop(0.72, 'rgba(0, 0, 0, 0.95)');
        gradient.addColorStop(0.90, 'rgba(0, 0, 0, 0.45)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        fCtx.fillStyle = gradient;
        fCtx.beginPath();
        fCtx.ellipse(cx, cy, rx * 1.1, ry * 1.1, 0, 0, Math.PI * 2);
        fCtx.fill();
        fCtx.restore();

        ctx.save();
        ctx.globalAlpha = 0.96;
        ctx.drawImage(faceCanvas, 0, 0);
        ctx.restore();

        resolve(canvas.toDataURL('image/jpeg', 0.95));
      };

      userImg.onerror = () => resolve(canvas.toDataURL('image/jpeg', 0.95));
      userImg.src = userImageSrc;
    };

    baseImg.onerror = () => {
      ctx.fillStyle = isMale ? '#d9ab88' : '#e6c2a8';
      ctx.fillRect(0, 0, 512, 512);

      const userImg = new Image();
      userImg.crossOrigin = 'anonymous';
      userImg.onload = () => {
        ctx.drawImage(userImg, 150, 70, 210, 230);
        resolve(canvas.toDataURL('image/jpeg', 0.95));
      };
      userImg.onerror = () => resolve(canvas.toDataURL('image/jpeg', 0.95));
      userImg.src = userImageSrc;
    };

    baseImg.src = baseSkinUrl;
  });
}
