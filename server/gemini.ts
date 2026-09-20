import { GoogleGenAI, Modality } from '@google/genai';
import { z } from 'zod';
import type { Analysis, AvatarParams, CompareResult } from '../shared/types.js';
import type { AiService, NormalizedImage } from './app.js';

import { analysisSchema, compareSchema, avatarSchema } from './schemas.js';

function parts(images: NormalizedImage[], prompt: string) { return [{ text: prompt }, ...images.map((image) => ({ inlineData: { data: image.data, mimeType: image.mimeType } }))]; }
function jsonText(response: { text?: string }) { if (!response.text) throw new Error('Empty structured response'); return JSON.parse(response.text); }

function simplifyJsonSchema(schema: any): any {
  if (!schema || typeof schema !== 'object') return schema;
  if (Array.isArray(schema)) return schema.map(simplifyJsonSchema);
  const { minLength, maxLength, minimum, maximum, minItems, maxItems, exclusiveMinimum, exclusiveMaximum, ...rest } = schema;
  const result: any = {};
  for (const [key, value] of Object.entries(rest)) {
    result[key] = simplifyJsonSchema(value);
  }
  return result;
}

function normalizeScore(raw: any, fallback = 75): number {
  if (typeof raw !== 'number' || isNaN(raw)) return fallback;
  if (raw > 0 && raw <= 10) return Math.round(raw * 10);
  return Math.round(Math.max(0, Math.min(100, raw)));
}

function sanitizeAnalysis(data: any): Analysis {
  const score = normalizeScore(data?.score, 75);
  const verdict = typeof data?.verdict === 'string' && data.verdict.trim() ? data.verdict.trim().slice(0, 300) : 'Style check complete.';
  const summary = typeof data?.summary === 'string' && data.summary.trim() ? data.summary.trim().slice(0, 3000) : 'Presentation analysis complete.';
  const metrics = Array.isArray(data?.metrics) && data.metrics.length > 0
    ? data.metrics.slice(0, 12).map((m: any) => ({
        label: String(m?.label ?? 'Detail').trim().slice(0, 120) || 'Detail',
        score: normalizeScore(m?.score, score),
        detail: String(m?.detail ?? '').trim().slice(0, 600) || 'Observed styling characteristic.',
      }))
    : [{ label: 'Overall', score, detail: summary.slice(0, 300) }];
  const tips = Array.isArray(data?.tips) ? data.tips.map((t: any) => String(t).trim().slice(0, 600)).filter(Boolean).slice(0, 20) : [];
  const callouts = Array.isArray(data?.callouts) && data.callouts.length > 0
    ? data.callouts.slice(0, 10).map((c: any) => ({
        label: String(c?.label ?? 'Feature').trim().slice(0, 120) || 'Feature',
        detail: String(c?.detail ?? '').trim().slice(0, 500) || 'Location highlight.',
        x: Math.max(0, Math.min(100, typeof c?.x === 'number' && !isNaN(c.x) ? c.x : 50)),
        y: Math.max(0, Math.min(100, typeof c?.y === 'number' && !isNaN(c.y) ? c.y : 50)),
      }))
    : undefined;
  const hairstyles = Array.isArray(data?.hairstyles) && data.hairstyles.length > 0
    ? data.hairstyles.slice(0, 10).map((h: any) => ({
        name: String(h?.name ?? 'Option').trim().slice(0, 120) || 'Option',
        description: String(h?.description ?? '').trim().slice(0, 600) || 'Hairstyle suggestion.',
      }))
    : undefined;
  const captions = Array.isArray(data?.captions) && data.captions.length > 0
    ? data.captions.slice(0, 10).map((c: any) => String(c).trim().slice(0, 500)).filter(Boolean)
    : undefined;

  return { score, verdict, summary, metrics, tips, callouts, hairstyles, captions, source: 'gemini' };
}


function sanitizeCompare(data: any): CompareResult {
  const winner = ['a', 'b', 'tie'].includes(data?.winner) ? data.winner : 'tie';
  const summary = typeof data?.summary === 'string' && data.summary.trim() ? data.summary.trim().slice(0, 1200) : 'Photo comparison completed.';
  const a = sanitizeAnalysis(data?.a ?? {});
  const b = sanitizeAnalysis(data?.b ?? {});
  const styleMatch = typeof data?.styleMatch === 'number' && !isNaN(data.styleMatch) ? Math.max(0, Math.min(100, Math.round(data.styleMatch))) : undefined;
  return { winner, summary, a, b, styleMatch, source: 'gemini' };
}

function sanitizeAvatar(data: any, presentation: string, height?: number): { params: AvatarParams; summary: string } {
  const p = data?.params ?? {};
  const heightVal = height !== undefined ? height : (typeof p.height === 'number' && !isNaN(p.height) ? Math.max(145, Math.min(205, p.height)) : 172);
  const buildVal = typeof p.build === 'number' && !isNaN(p.build) ? Math.max(0, Math.min(1, p.build)) : 0.5;
  const shouldersVal = typeof p.shoulders === 'number' && !isNaN(p.shoulders) ? Math.max(0, Math.min(1, p.shoulders)) : 0.5;
  const hex = (val: any, fallback: string) => typeof val === 'string' && /^#[0-9a-fA-F]{6}$/.test(val) ? val : fallback;
  const skinTone = hex(p.skinTone, '#d8b094');
  const hairColor = hex(p.hairColor, '#2c221e');
  const hairStyle = ['short', 'medium', 'long'].includes(p.hairStyle) ? p.hairStyle : 'medium';
  const pres = ['masculine', 'feminine', 'neutral'].includes(presentation) ? (presentation as AvatarParams['presentation']) : 'neutral';
  const summary = typeof data?.summary === 'string' && data.summary.trim() ? data.summary.trim().slice(0, 1000) : 'Approximate visible traits were used.';
  return {
    params: { height: heightVal, build: buildVal, shoulders: shouldersVal, skinTone, hairColor, hairStyle, presentation: pres },
    summary,
  };
}

export class GeminiService implements AiService {
  private keys: string[];
  private clients: Map<string, GoogleGenAI> = new Map();
  private cooldowns: Map<string, number> = new Map();
  private activeKeyIndex = 0;

  constructor(apiKey: string | string[], private model = 'gemini-2.5-flash', private imageModel = 'gemini-2.5-flash-image') {
    const raw = Array.isArray(apiKey) ? apiKey : [apiKey];
    this.keys = raw
      .flatMap((k) => (typeof k === 'string' ? k.split(',') : []))
      .map((k) => k.trim())
      .filter((k) => k.length > 0)
      .filter((k, i, arr) => arr.indexOf(k) === i);
  }

  private getClientForKey(key: string): GoogleGenAI {
    let client = this.clients.get(key);
    if (!client) {
      client = new GoogleGenAI({ apiKey: key });
      this.clients.set(key, client);
    }
    return client;
  }

  private async executeWithFailover<T>(
    operation: (client: GoogleGenAI, key: string, index: number) => Promise<T>
  ): Promise<T> {
    if (this.keys.length === 0) {
      throw Object.assign(new Error('API key missing'), { code: 'INVALID_API_KEY' });
    }

    const now = Date.now();
    const orderedIndices: number[] = [];
    for (let i = 0; i < this.keys.length; i++) {
      orderedIndices.push((this.activeKeyIndex + i) % this.keys.length);
    }

    const sortedIndices = [...orderedIndices].sort((a, b) => {
      const coolA = (this.cooldowns.get(this.keys[a]) ?? 0) > now ? 1 : 0;
      const coolB = (this.cooldowns.get(this.keys[b]) ?? 0) > now ? 1 : 0;
      return coolA - coolB;
    });

    let lastError: any = null;
    for (let attempt = 0; attempt < sortedIndices.length; attempt++) {
      const index = sortedIndices[attempt];
      const key = this.keys[index];
      const client = this.getClientForKey(key);
      const maskedKey = `${key.slice(0, 10)}...${key.slice(-4)}`;

      try {
        const result = await operation(client, key, index);
        this.activeKeyIndex = index;
        this.cooldowns.delete(key);
        return result;
      } catch (err: any) {
        lastError = err;
        const status = err.status || err.statusCode;
        const isQuota = status === 429 || err.message?.includes('quota') || err.message?.includes('RESOURCE_EXHAUSTED');

        const cooldownMs = isQuota ? 60_000 : 30_000;
        this.cooldowns.set(key, Date.now() + cooldownMs);

        console.warn(
          `[GeminiService] API key [${maskedKey}] (key ${index + 1}/${this.keys.length}) failed (${status || 'error'}: ${err.message?.slice(0, 120)}). ${
            this.keys.length > 1 ? 'Switching to fallback key...' : ''
          }`
        );

        if (this.keys.length === 1) break;
      }
    }

    console.error(`[GeminiService] All ${this.keys.length} API key(s) in pool failed.`);
    throw lastError;
  }

  async analyze(input: Parameters<AiService['analyze']>[0]): Promise<Analysis> {
    const context = JSON.stringify({ kind: input.kind, mood: input.mood, format: input.format, occasion: input.occasion, garments: input.garments });
    const prompt = `Analyze the first VibeCheck image for ${context}. Return JSON only. Keep the verdict punchy and concise (under 120 characters). Give specific, actionable composition, lighting, styling, outfit, and pose feedback grounded in visible evidence. All scores must be integer percentages from 0 to 100 (e.g. 85 or 92, not single digits). For loox, score hairstyle/style compatibility and include 3 hairstyle options and up to 4 location-specific callouts. For story, include 3 caption ideas. Later supplied images are style references: compare palette, framing, visual patterns and likeness to those references in a Style match metric. Coordinates are percentages 0-100 from the top-left. Never infer identity, ethnicity, age, gender, health, personality, attractiveness, or other sensitive/demographic traits. Do not make medical claims. Scores are subjective presentation guidance. Required shape: {score,verdict,summary,metrics:[{label,score,detail}],tips,callouts?:[{label,detail,x,y}],hairstyles?:[{name,description}],captions?:string[],source:"gemini"}.`;
    const response = await this.executeWithFailover(async (client) => {
      return client.models.generateContent({
        model: this.model,
        contents: [{ role: 'user', parts: parts([input.image, ...(input.referenceImages ?? [])], prompt) }],
        config: {
          responseMimeType: 'application/json',
          responseJsonSchema: simplifyJsonSchema(z.toJSONSchema(analysisSchema)),
          httpOptions: { timeout: 120000 },
          temperature: 0.35,
        },
      });
    });
    const parsed = sanitizeAnalysis(jsonText(response));
    return analysisSchema.parse(parsed);
  }

  async compare(input: Parameters<AiService['compare']>[0]): Promise<CompareResult> {
    const prompt = `Compare image A then image B${input.mood ? ` for mood ${input.mood}` : ''}; later images are optional style references. Return JSON only with winner a, b, or tie; practical explanation; independent analyses a and b using the full analysis shape; optional styleMatch 0-100; source "gemini". Keep verdicts punchy and concise (under 120 characters). All scores must be integer percentages from 0 to 100. Judge presentation, composition, lighting, pose, and styling. Use normalized x/y callouts. Do not infer identity, demographics, health, personality, or attractiveness.`;

    const response = await this.executeWithFailover(async (client) => {
      return client.models.generateContent({
        model: this.model,
        contents: [{ role: 'user', parts: parts([input.imageA, input.imageB, ...(input.referenceImages ?? [])], prompt) }],
        config: {
          responseMimeType: 'application/json',
          responseJsonSchema: simplifyJsonSchema(z.toJSONSchema(compareSchema)),
          httpOptions: { timeout: 120000 },
          temperature: 0.3,
        },
      });
    });
    const parsed = sanitizeCompare(jsonText(response));
    return compareSchema.parse(parsed);
  }

  async avatar(input: Parameters<AiService['avatar']>[0]): Promise<{ params: AvatarParams; summary: string }> {
    const prompt = `Create approximate parametric avatar settings from only clearly visible proportions and colors. Presentation must be ${input.presentation}; height is ${input.height ?? 'unobservable, use 172 cm as a moderate default'}. Use moderate 0.5 defaults when build or shoulder proportions are obscured. Do not claim precise body measurements, fit, identity, demographics, health, or attractiveness. Return JSON only: {params:{height,build,shoulders,skinTone,hairColor,hairStyle,presentation},summary}. Explain that values are approximate.`;
    const imgs = [input.image, input.bodyImage].filter((x): x is NormalizedImage => Boolean(x));
    const response = await this.executeWithFailover(async (client) => {
      return client.models.generateContent({
        model: this.model,
        contents: [{ role: 'user', parts: parts(imgs, prompt) }],
        config: {
          responseMimeType: 'application/json',
          responseJsonSchema: simplifyJsonSchema(z.toJSONSchema(avatarSchema)),
          httpOptions: { timeout: 120000 },
          temperature: 0.2,
        },
      });
    });
    const parsed = sanitizeAvatar(jsonText(response), input.presentation, input.height);
    return avatarSchema.parse(parsed);
  }

  async generatePreview(input: Parameters<AiService['generatePreview']>[0]): Promise<{ image: string; mimeType: string }> {
    const prompt = `Edit the first supplied person photo to preview this ${input.kind} request: ${input.prompt}. Preserve the person's recognizable appearance, pose, background, and overall photographic realism. Additional images are garments to apply when relevant. Return one edited image.`;
    try {
      const response = await this.executeWithFailover(async (client) => {
        return client.models.generateContent({
          model: this.imageModel,
          contents: [{ role: 'user', parts: parts([input.image, ...(input.garmentImages ?? [])], prompt) }],
          config: { httpOptions: { timeout: 120000 }, responseModalities: [Modality.IMAGE, Modality.TEXT] },
        });
      });
      const output = response.candidates?.[0]?.content?.parts?.find((part) => part.inlineData?.data)?.inlineData;
      if (!output?.data || !output.mimeType?.startsWith('image/')) throw Object.assign(new Error('No generated image'), { code: 'UNSUPPORTED_GENERATION' });
      return { image: `data:${output.mimeType};base64,${output.data}`, mimeType: output.mimeType };
    } catch (err: any) {
      if (err.status === 429 || err.message?.includes('limit: 0') || err.message?.includes('free_tier')) {
        throw Object.assign(
          new Error('AI image generation requires Google AI Studio billing or an account with image quota. Free-tier Gemini keys do not include image generation quota.'),
          { code: 'AI_QUOTA', status: 429, retryAfter: 30 }
        );
      }
      throw err;
    }
  }
}


