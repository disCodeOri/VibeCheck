import { z } from 'zod';
const metric = z.object({ label: z.string().min(1).max(120), score: z.number().min(0).max(100), detail: z.string().min(1).max(600) }).strict();
export const analysisSchema = z.object({
  score: z.number().min(0).max(100), verdict: z.string().min(1).max(300), summary: z.string().min(1).max(3000),
  metrics: z.array(metric).min(1).max(12), tips: z.array(z.string().min(1).max(600)).max(20),
  callouts: z.array(z.object({ label: z.string().min(1).max(120), detail: z.string().min(1).max(500), x: z.number().min(0).max(100), y: z.number().min(0).max(100) }).strict()).max(10).optional(),
  hairstyles: z.array(z.object({ name: z.string().min(1).max(120), description: z.string().min(1).max(600) }).strict()).max(10).optional(),
  captions: z.array(z.string().min(1).max(500)).max(10).optional(), source: z.enum(['gemini','bedrock']),
}).strict();
export const compareSchema = z.object({ winner: z.enum(['a', 'b', 'tie']), summary: z.string().min(1).max(1200), a: analysisSchema, b: analysisSchema, styleMatch: z.number().min(0).max(100).optional(), source: z.enum(['gemini','bedrock']) }).strict();
export const avatarSchema = z.object({ params: z.object({ height: z.number().min(145).max(205), build: z.number().min(0).max(1), shoulders: z.number().min(0).max(1), skinTone: z.string().regex(/^#[0-9a-fA-F]{6}$/), hairColor: z.string().regex(/^#[0-9a-fA-F]{6}$/), hairStyle: z.enum(['short', 'medium', 'long']), presentation: z.enum(['masculine', 'feminine', 'neutral']) }).strict(), summary: z.string().min(1).max(1000) }).strict();


