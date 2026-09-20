export type CheckKind = 'story' | 'loox' | 'outfit';
export interface Metric { label: string; score: number; detail: string }
export interface Callout { label: string; detail: string; x: number; y: number }
export interface HairStyle { name: string; description: string }
export interface Analysis {
  score: number; verdict: string; summary: string; metrics: Metric[]; tips: string[];
  callouts?: Callout[]; hairstyles?: HairStyle[]; captions?: string[];
  source: 'gemini' | 'bedrock' | 'example' | 'manual';
}
export interface CompareResult { winner: 'a' | 'b' | 'tie'; summary: string; a: Analysis; b: Analysis; styleMatch?: number; source: 'gemini' | 'bedrock' | 'example' }
export interface AvatarParams { height: number; build: number; shoulders: number; skinTone: string; hairColor: string; hairStyle: 'short' | 'medium' | 'long'; presentation: 'masculine' | 'feminine' | 'neutral' }
export interface Garment { id: string; name: string; category: 'tops' | 'bottoms' | 'layers' | 'shoes' | 'accessories'; color: string; image: string; createdAt: number; notes?: string }
export interface SavedLook { id: string; kind: CheckKind; title: string; image: string; secondaryImage?: string; analysis: Analysis; createdAt: number; garmentIds?: string[]; avatar?: AvatarParams }
export interface Profile { name: string; mood: string; presentation: 'masculine' | 'feminine' | 'neutral'; style?: 'soft' | 'sharp'; avatar: AvatarParams; photo?: string; bodyPhoto?: string; consent: boolean; onboardingDone: boolean }
export interface AiRequest { kind: CheckKind; image: string; mood?: string; format?: 'story' | 'post'; referenceImages?: string[]; occasion?: string; garments?: Array<{name: string; color: string; category: string}> }
export interface HealthStatus { configured: boolean; model: string; imageModel: string; provider?:'gemini'|'bedrock' }
