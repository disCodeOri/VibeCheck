import express, { type NextFunction, type Request, type Response } from 'express';
import path from 'node:path';
import { existsSync } from 'node:fs';
import sharp from 'sharp';
import {photoPermission} from './privacy.js';
import { z, ZodError } from 'zod';
import type { AiRequest, Analysis, AvatarParams, CompareResult } from '../shared/types.js';

export interface NormalizedImage { data: string; mimeType: 'image/jpeg' }
export interface AiService {
  analyze(input: Omit<AiRequest, 'image' | 'referenceImages'> & { image: NormalizedImage; referenceImages?: NormalizedImage[] }): Promise<Analysis>;
  compare(input: { imageA: NormalizedImage; imageB: NormalizedImage; mood?: string; referenceImages?: NormalizedImage[] }): Promise<CompareResult>;
  avatar(input: { image?: NormalizedImage; bodyImage?: NormalizedImage; presentation: AvatarParams['presentation']; height?: number }): Promise<{ params: AvatarParams; summary: string }>;
  generatePreview(input: { image: NormalizedImage; kind: 'hair' | 'outfit'; prompt: string; garmentImages?: NormalizedImage[] }): Promise<{ image: string; mimeType: string }>;
}

export interface AppOptions {
  provider?: 'gemini' | 'bedrock';
  configured?: boolean;
  model?: string;
  imageModel?: string;
  rateLimit?: { max: number; windowMs: number };
  maxConcurrent?: number;
  generationEnabled?: boolean;
}

const dataUrl = z.string().min(32).startsWith('data:image/');
const shortText = z.string().trim().min(1).max(800);
export const analyzeSchema = z.object({
  kind: z.enum(['story', 'loox', 'outfit']), image: dataUrl,
  mood: z.string().trim().max(100).optional(), format: z.enum(['story', 'post']).optional(),
  referenceImages: z.array(dataUrl).max(3).optional(), occasion: z.string().trim().max(120).optional(),
  garments: z.array(z.object({ name: z.string().trim().min(1).max(100), color: z.string().trim().min(1).max(50), category: z.string().trim().min(1).max(50) })).max(30).optional(),
}).strict();
export const compareSchema = z.object({ imageA: dataUrl, imageB: dataUrl, mood: z.string().trim().max(100).optional(), referenceImages: z.array(dataUrl).max(3).optional() }).strict();
export const avatarSchema = z.object({ image: dataUrl.optional(), bodyImage: dataUrl.optional(), presentation: z.enum(['masculine', 'feminine', 'neutral']), height: z.number().finite().min(145).max(205).optional() }).strict().refine((x) => x.image || x.bodyImage, 'At least one image is required.');
export const previewSchema = z.object({ image: dataUrl, kind: z.enum(['hair', 'outfit']), prompt: shortText, garmentImages: z.array(dataUrl).max(5).optional() }).strict();

class HttpError extends Error { constructor(public status: number, public code: string, message: string, public retryAfter?: number) { super(message); } }

export async function normalizeImage(value: string): Promise<NormalizedImage> {
  const match = /^data:image\/(png|jpe?g|webp);base64,([A-Za-z0-9+/=]+)$/i.exec(value);
  if (!match) throw new HttpError(400, 'INVALID_REQUEST', 'Images must be base64 data URLs in PNG, JPEG, or WebP format.');
  const bytes = Buffer.from(match[2], 'base64');
  if (!bytes.length || bytes.length > 6 * 1024 * 1024) throw new HttpError(400, 'INVALID_REQUEST', 'Each image must be 6 MB or smaller.');
  try {
    const image = sharp(bytes, { failOn: 'warning', limitInputPixels: 40_000_000 });
    const metadata = await image.metadata();
    if (!metadata.width || !metadata.height || !['png', 'jpeg', 'webp'].includes(metadata.format ?? '')) throw new Error('unsupported');
    const normalized = await image.rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).flatten({ background: '#ffffff' }).jpeg({ quality: 86 }).toBuffer();
    return { data: normalized.toString('base64'), mimeType: 'image/jpeg' };
  } catch {
    throw new HttpError(400, 'INVALID_REQUEST', 'One or more images are corrupt or unsupported.');
  }
}

async function images(values?: string[]) { return values ? Promise.all(values.map(normalizeImage)) : undefined; }

export function createApp(ai: AiService, options: AppOptions = {}) {
  const app = express();
  const model = options.model ?? 'gemini-2.5-flash';
  const imageModel = options.imageModel ?? 'gemini-2.5-flash-image';
  const rate = options.rateLimit ?? { max: 20, windowMs: 60_000 };
  const buckets = new Map<string, { count: number; reset: number }>();
  let active = 0;
  let processingEnabled = true;
  const generationEnabled = options.generationEnabled ?? true;
  app.disable('x-powered-by');
  app.use(express.json({ limit: '42mb', strict: true }));
  app.use((req, _res, next) => {
    const origin = req.get('origin');
    if (origin) {
      try {
        const url = new URL(origin);
        if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) throw new Error();
      } catch { return next(new HttpError(403, 'ORIGIN_DENIED', 'This origin is not allowed.')); }
    }
    next();
  });
  app.get('/api/config', (_req, res) => res.json({cloudEnabled:false,provider:options.provider??'gemini'}));
  app.get('/api/health', (_req, res) => res.json({ configured: options.configured ?? false, model, imageModel,provider:options.provider??'gemini' }));
  app.get('/api/privacy', (_req,res) => res.json({processingEnabled,generationEnabled,...photoPermission('analyze',processingEnabled,generationEnabled)}));
  app.post('/api/privacy', (req,res,next) => {
    const parsed=z.object({processingEnabled:z.boolean()}).strict().safeParse(req.body);
    if(!parsed.success)return next(new HttpError(400,'INVALID_REQUEST','Choose whether photo processing is enabled.'));
    processingEnabled=parsed.data.processingEnabled;
    res.json({processingEnabled,generationEnabled,...photoPermission('analyze',processingEnabled,generationEnabled)});
  });
  // A dry run evaluates the same policy as the request boundary, with no image
  // and no provider call. Used by the demo to prove both allow and deny safely.
  app.get('/api/privacy/proof', (_req,res) => res.json({
    enabled:photoPermission('analyze',true,false),
    paused:photoPermission('analyze',false,false),
    generation:photoPermission('generate-preview',true,false),
  }));
  app.use('/api', (req,_res,next) => {
    if(req.method==='POST' && ['/analyze','/compare','/avatar','/generate-preview'].includes(req.path) && !photoPermission(req.path.slice(1),processingEnabled,generationEnabled).allowed)
      return next(new HttpError(403,'PHOTO_PROCESSING_PAUSED',processingEnabled?'Image generation is disabled in this zero-budget local setup.':'Photo processing is paused. Enable it in Your space to request an AI check.'));
    next();
  });
  app.use('/api', (req, res, next) => {
    if (req.method === 'GET') return next();
    const key = req.ip ?? 'local';
    const now = Date.now();
    let bucket = buckets.get(key);
    if (!bucket || bucket.reset <= now) { bucket = { count: 0, reset: now + rate.windowMs }; buckets.set(key, bucket); }
    if (bucket.count >= rate.max) {
      const retryAfter = Math.max(1, Math.ceil((bucket.reset - now) / 1000));
      res.setHeader('Retry-After', retryAfter);
      return next(new HttpError(429, 'RATE_LIMITED', 'Too many requests. Try again shortly.', retryAfter));
    }
    bucket.count++;
    if (active >= (options.maxConcurrent ?? 2)) return next(new HttpError(429, 'BUSY', 'The AI service is busy. Try again shortly.', 2));
    active++;
    res.once('finish', () => { active--; });
    res.once('close', () => { if (!res.writableFinished) active--; });
    next();
  });

  app.post('/api/analyze', asyncRoute(async (req, res) => {
    const body = analyzeSchema.parse(req.body);
    res.json(await ai.analyze({ ...body, image: await normalizeImage(body.image), referenceImages: await images(body.referenceImages) }));
  }));
  app.post('/api/compare', asyncRoute(async (req, res) => {
    const body = compareSchema.parse(req.body);
    res.json(await ai.compare({ ...body, imageA: await normalizeImage(body.imageA), imageB: await normalizeImage(body.imageB), referenceImages: await images(body.referenceImages) }));
  }));
  app.post('/api/avatar', asyncRoute(async (req, res) => {
    const body = avatarSchema.parse(req.body);
    const result = await ai.avatar({ ...body, image: body.image ? await normalizeImage(body.image) : undefined, bodyImage: body.bodyImage ? await normalizeImage(body.bodyImage) : undefined });
    if (body.height !== undefined) result.params.height = body.height;
    result.params.build = Math.min(1, Math.max(0, result.params.build));
    result.params.shoulders = Math.min(1, Math.max(0, result.params.shoulders));
    res.json(result);
  }));
  app.post('/api/generate-preview', asyncRoute(async (req, res) => {
    const body = previewSchema.parse(req.body);
    res.json(await ai.generatePreview({ ...body, image: await normalizeImage(body.image), garmentImages: await images(body.garmentImages) }));
  }));

  // OpenCV Face Detection, Alignment, and Seamless Skin Blending
  app.post('/api/face/align', asyncRoute(async (req, res) => {
    const { image, isMale } = req.body || {};
    if (!image || typeof image !== 'string') {
      throw new HttpError(400, 'INVALID_REQUEST', 'Missing image data');
    }

    const pyPath = '/home/ayush/.local/state/quickshell/.venv/bin/python3';
    const scriptPath = path.resolve(process.cwd(), 'scripts/align_face.py');

    const { spawn } = await import('node:child_process');
    const proc = spawn(pyPath, [scriptPath]);

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (d) => { stdout += d.toString(); });
    proc.stderr.on('data', (d) => { stderr += d.toString(); });

    proc.on('close', (code) => {
      if (code !== 0) {
        console.error('OpenCV align_face error:', stderr);
        return res.status(500).json({ error: 'Face alignment failed', detail: stderr });
      }
      try {
        const parsed = JSON.parse(stdout);
        res.json(parsed);
      } catch (err) {
        res.status(500).json({ error: 'Failed to parse face alignment output' });
      }
    });

    proc.stdin.write(JSON.stringify({ image, isMale: !!isMale }));
    proc.stdin.end();
  }));

  if (process.env.NODE_ENV === 'production') {
    const dist = path.resolve(process.cwd(), 'dist');
    if (existsSync(dist)) {
      app.use(express.static(dist, { index: false, dotfiles: 'deny' }));
      app.get('/{*splat}', (req, res, next) => req.path.startsWith('/api/') ? next() : res.sendFile(path.join(dist, 'index.html')));
    }
  }
  app.use((_req, _res, next) => next(new HttpError(404, 'NOT_FOUND', 'Route not found.')));
  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    let normalized = error;
    if (error instanceof ZodError || error instanceof SyntaxError) normalized = new HttpError(400, 'INVALID_REQUEST', 'The request payload is invalid.');
    if (normalized instanceof HttpError) return res.status(normalized.status).json({ error: { code: normalized.code, message: normalized.message, ...(normalized.retryAfter ? { retryAfter: normalized.retryAfter } : {}) } });
    const provider = normalized as { code?: string; status?: number; message?: string };
    if (provider.code === 'INVALID_REQUEST' && provider.status === 400) return res.status(400).json({error:{code:'INVALID_REQUEST',message:'This preview needs a supported garment reference image.'}});
    if (provider.code === 'INVALID_API_KEY' || provider.status === 401 || provider.status === 403) return res.status(503).json({ error: { code: 'AI_UNAVAILABLE', message: 'AI service is not configured or authorized.' } });
    if (provider.status === 429) {
      const isQuotaZero = provider.message?.includes('limit: 0') || provider.message?.includes('free_tier') || provider.message?.includes('Google AI Studio billing');
      const message = isQuotaZero
        ? (provider.message ?? 'AI image generation requires Google AI Studio billing or an account with image quota.')
        : (provider.message ?? 'AI quota is temporarily exhausted.');
      return res.status(429).json({ error: { code: 'AI_QUOTA', message, retryAfter: 30 } });
    }
    if (provider.code === 'UNSUPPORTED_GENERATION') return res.status(501).json({ error: { code: 'UNSUPPORTED_GENERATION', message: 'Image generation is not supported by the configured model.' } });
    return res.status(502).json({ error: { code: 'AI_ERROR', message: 'The AI provider could not complete the request.' } });
  });

  return app;
}

function asyncRoute(handler: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => void handler(req, res).catch(next);
}
