import { z } from 'zod';
const metric = z.object({ label: z.string().min(1).max(80), score: z.number().min(0).max(100), detail: z.string().min(1).max(300) }).strict();
export const analysisSchema = z.object({
  score: z.number().min(0).max(100), verdict: z.string().min(1).max(120), summary: z.string().min(1).max(600),
  metrics: z.array(metric).min(2).max(8), tips: z.array(z.string().min(1).max(300)).min(1).max(8),
  callouts: z.array(z.object({ label: z.string().min(1).max(80), detail: z.string().min(1).max(240), x: z.number().min(0).max(100), y: z.number().min(0).max(100) }).strict()).max(8).optional(),
  hairstyles: z.array(z.object({ name: z.string().min(1).max(100), description: z.string().min(1).max(300) }).strict()).max(6).optional(),
  captions: z.array(z.string().min(1).max(300)).max(6).optional(), source: z.enum(['gemini','bedrock']),
}).strict();
export const compareSchema = z.object({ winner: z.enum(['a', 'b', 'tie']), summary: z.string().min(1).max(600), a: analysisSchema, b: analysisSchema, styleMatch: z.number().min(0).max(100).optional(), source: z.enum(['gemini','bedrock']) }).strict();
export const avatarSchema = z.object({ params: z.object({ height: z.number().min(145).max(205), build: z.number().min(0).max(1), shoulders: z.number().min(0).max(1), skinTone: z.string().regex(/^#[0-9a-fA-F]{6}$/), hairColor: z.string().regex(/^#[0-9a-fA-F]{6}$/), hairStyle: z.enum(['short', 'medium', 'long']), presentation: z.enum(['masculine', 'feminine', 'neutral']) }).strict(), summary: z.string().min(1).max(500) }).strict();

