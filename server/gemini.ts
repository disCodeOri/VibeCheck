import { GoogleGenAI, Modality } from '@google/genai';
import { z } from 'zod';
import type { Analysis, AvatarParams, CompareResult } from '../shared/types.js';
import type { AiService, NormalizedImage } from './app.js';

import { analysisSchema, compareSchema, avatarSchema } from './schemas.js';

function parts(images: NormalizedImage[], prompt: string) { return [{ text: prompt }, ...images.map((image) => ({ inlineData: { data: image.data, mimeType: image.mimeType } }))]; }
function jsonText(response: { text?: string }) { if (!response.text) throw new Error('Empty structured response'); return JSON.parse(response.text); }

export class GeminiService implements AiService {
  private client: GoogleGenAI | null;
  constructor(apiKey: string, private model = 'gemini-2.5-flash', private imageModel = 'gemini-2.5-flash-image') { this.client = apiKey ? new GoogleGenAI({ apiKey }) : null; }

  private getClient() { if (!this.client) throw Object.assign(new Error('API key missing'), {code:'INVALID_API_KEY'}); return this.client; }

  async analyze(input: Parameters<AiService['analyze']>[0]): Promise<Analysis> {
    const context = JSON.stringify({ kind: input.kind, mood: input.mood, format: input.format, occasion: input.occasion, garments: input.garments });
    const prompt = `Analyze the first VibeCheck image for ${context}. Return JSON only. Give specific, actionable composition, lighting, styling, outfit, and pose feedback grounded in visible evidence. For loox, score hairstyle/style compatibility and include 3 hairstyle options and up to 4 location-specific callouts. For story, include 3 caption ideas. Later supplied images are style references: compare palette, framing, visual patterns and likeness to those references in a Style match metric. Coordinates are percentages 0-100 from the top-left. Never infer identity, ethnicity, age, gender, health, personality, attractiveness, or other sensitive/demographic traits. Do not make medical claims. Scores are subjective presentation guidance. Required shape: {score,verdict,summary,metrics:[{label,score,detail}],tips,callouts?:[{label,detail,x,y}],hairstyles?:[{name,description}],captions?:string[],source:"gemini"}.`;
    const response = await this.getClient().models.generateContent({ model: this.model, contents: [{ role: 'user', parts: parts([input.image, ...(input.referenceImages ?? [])], prompt) }], config: { responseMimeType: 'application/json', responseJsonSchema: z.toJSONSchema(analysisSchema), httpOptions: { timeout: 120000 }, temperature: 0.35 } });
    return analysisSchema.parse(jsonText(response));
  }

  async compare(input: Parameters<AiService['compare']>[0]): Promise<CompareResult> {
    const prompt = `Compare image A then image B${input.mood ? ` for mood ${input.mood}` : ''}; later images are optional style references. Return JSON only with winner a, b, or tie; practical explanation; independent analyses a and b using the full analysis shape; optional styleMatch 0-100; source "gemini". Judge presentation, composition, lighting, pose, and styling. Use normalized x/y callouts. Do not infer identity, demographics, health, personality, or attractiveness.`;
    const response = await this.getClient().models.generateContent({ model: this.model, contents: [{ role: 'user', parts: parts([input.imageA, input.imageB, ...(input.referenceImages ?? [])], prompt) }], config: { responseMimeType: 'application/json', responseJsonSchema: z.toJSONSchema(compareSchema), httpOptions: { timeout: 120000 }, temperature: 0.3 } });
    return compareSchema.parse(jsonText(response));
  }

  async avatar(input: Parameters<AiService['avatar']>[0]): Promise<{ params: AvatarParams; summary: string }> {
    const prompt = `Create approximate parametric avatar settings from only clearly visible proportions and colors. Presentation must be ${input.presentation}; height is ${input.height ?? 'unobservable, use 172 cm as a moderate default'}. Use moderate 0.5 defaults when build or shoulder proportions are obscured. Do not claim precise body measurements, fit, identity, demographics, health, or attractiveness. Return JSON only: {params:{height,build,shoulders,skinTone,hairColor,hairStyle,presentation},summary}. Explain that values are approximate.`;
    const imgs = [input.image, input.bodyImage].filter((x): x is NormalizedImage => Boolean(x));
    const response = await this.getClient().models.generateContent({ model: this.model, contents: [{ role: 'user', parts: parts(imgs, prompt) }], config: { responseMimeType: 'application/json', responseJsonSchema: z.toJSONSchema(avatarSchema), httpOptions: { timeout: 120000 }, temperature: 0.2 } });
    const parsed = avatarSchema.parse(jsonText(response));
    parsed.params.presentation = input.presentation;
    if (input.height !== undefined) parsed.params.height = input.height;
    return parsed;
  }

  async generatePreview(input: Parameters<AiService['generatePreview']>[0]): Promise<{ image: string; mimeType: string }> {
    const prompt = `Edit the first supplied person photo to preview this ${input.kind} request: ${input.prompt}. Preserve the person's recognizable appearance, pose, background, and overall photographic realism. Additional images are garments to apply when relevant. Return one edited image.`;
    const response = await this.getClient().models.generateContent({ model: this.imageModel, contents: [{ role: 'user', parts: parts([input.image, ...(input.garmentImages ?? [])], prompt) }], config: { httpOptions: { timeout: 120000 }, responseModalities: [Modality.IMAGE, Modality.TEXT] } });
    const output = response.candidates?.[0]?.content?.parts?.find((part) => part.inlineData?.data)?.inlineData;
    if (!output?.data || !output.mimeType?.startsWith('image/')) throw Object.assign(new Error('No generated image'), { code: 'UNSUPPORTED_GENERATION' });
    return { image: `data:${output.mimeType};base64,${output.data}`, mimeType: output.mimeType };
  }
}
