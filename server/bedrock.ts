import { BedrockRuntimeClient, ConverseCommand, InvokeModelCommand, type ConverseCommandOutput, type InvokeModelCommandOutput } from '@aws-sdk/client-bedrock-runtime';
import { DetectFacesCommand, RekognitionClient, type DetectFacesCommandOutput } from '@aws-sdk/client-rekognition';
import { NodeHttpHandler } from '@smithy/node-http-handler';
import { z } from 'zod';
import type { Analysis, AvatarParams, CompareResult } from '../shared/types.js';
import type { AiService, NormalizedImage } from './app.js';
import { analysisSchema, avatarSchema, compareSchema } from './schemas.js';

const bedrockAnalysisSchema = analysisSchema.extend({ source: z.literal('bedrock') });
const bedrockCompareSchema = compareSchema.extend({ source: z.literal('bedrock'), a: bedrockAnalysisSchema, b: bedrockAnalysisSchema });

type SendClient = { send(command: unknown, options?: { abortSignal?: AbortSignal }): Promise<unknown> };
export interface BedrockConfig { region: string; model: string; imageModel: string; useRekognition?: boolean }
export interface BedrockClients { bedrock?: SendClient; rekognition?: SendClient }

class BedrockServiceError extends Error {
  constructor(public code: string, message: string, public status?: number) { super(message); }
}

export class BedrockService implements AiService {
  private bedrock: SendClient;
  private rekognition?: SendClient;
  constructor(private config: BedrockConfig, clients: BedrockClients = {}) {
    const requestHandler = new NodeHttpHandler({ connectionTimeout: 10_000, requestTimeout: 120_000 });
    this.bedrock = clients.bedrock ?? new BedrockRuntimeClient({ region: config.region, requestHandler });
    this.rekognition = config.useRekognition ? clients.rekognition ?? new RekognitionClient({ region: config.region, requestHandler }) : undefined;
  }

  async analyze(input: Parameters<AiService['analyze']>[0]): Promise<Analysis> {
    const face = input.kind === 'loox' ? await this.faceContext(input.image) : undefined;
    const referenceGuidance = input.referenceImages?.length ? `The ${input.referenceImages.length} images after the subject are reference images. Identify their reusable visual patterns—composition, palette, lighting, pose, styling, and mood—then explain concretely how the subject can approach those patterns without claiming the images depict the same person.` : 'There are no reference images.';
    const storyGuidance = input.kind === 'story' ? 'Return 2-4 concise captions:string[] matched to the requested mood/format and visible image; captions must not assert identity or hidden traits.' : '';
    const prompt = `Return JSON only for a VibeCheck ${input.kind} analysis. Context: ${JSON.stringify({ mood: input.mood, format: input.format, occasion: input.occasion, garments: input.garments })}. ${referenceGuidance} Give specific visible composition, lighting, pose, hairstyle and clothing feedback. For loox include hairstyle compatibility and hairstyle options. ${storyGuidance} Coordinates are percentages 0-100 from top-left. Never infer identity, age, gender, ethnicity, emotion, health, personality, or attractiveness. Rekognition geometry/quality, when present, is measurement support only: ${JSON.stringify(face)}. Exact shape: {score:number 0-100,verdict:string,summary:string,metrics:[{label:string,score:number 0-100,detail:string}],tips:string[],callouts?:[{label:string,detail:string,x:number 0-100,y:number 0-100}],hairstyles?:[{name:string,description:string}],captions?:string[],source:"bedrock"}.`;
    return bedrockAnalysisSchema.parse(await this.converse([input.image, ...(input.referenceImages ?? [])], prompt)) as Analysis;
  }

  async compare(input: Parameters<AiService['compare']>[0]): Promise<CompareResult> {
    const prompt = `Images are A, B, then optional reference images. Compare A and B on visible composition, lighting, pose, hairstyle and clothing${input.mood ? ` for mood ${input.mood}` : ''}. If references are present, use their visual patterns as a style target and explain which candidate approaches them more closely; do not claim likeness or shared identity. Return JSON only in this complete shape: {winner:"a"|"b"|"tie",summary:string,a:{score,verdict,summary,metrics:[{label,score,detail}],tips:string[],callouts?:[{label,detail,x,y}],hairstyles?:[{name,description}],captions?:string[],source:"bedrock"},b:{score,verdict,summary,metrics:[{label,score,detail}],tips:string[],callouts?:[{label,detail,x,y}],hairstyles?:[{name,description}],captions?:string[],source:"bedrock"},styleMatch?:number 0-100,source:"bedrock"}. All scores and callout x/y coordinates are 0-100. Never infer identity, demographics, emotions, health, personality, or attractiveness.`;
    return bedrockCompareSchema.parse(await this.converse([input.imageA, input.imageB, ...(input.referenceImages ?? [])], prompt)) as CompareResult;
  }

  async avatar(input: Parameters<AiService['avatar']>[0]): Promise<{ params: AvatarParams; summary: string }> {
    const images = [input.image, input.bodyImage].filter((value): value is NormalizedImage => Boolean(value));
    const face = input.image ? await this.faceContext(input.image) : undefined;
    const prompt = `Return JSON only with approximate parametric avatar settings derived from visible proportions and colors. Presentation is ${input.presentation}; supplied height is ${input.height ?? 'unobservable, use 172 cm'}. Use 0.5 for obscured build/shoulders. Bounds: height 145-205 centimeters; build and shoulders 0-1; skinTone and hairColor must be #RRGGBB; hairStyle must be short|medium|long; presentation must be masculine|feminine|neutral and exactly ${input.presentation}. Do not claim precise reconstruction or measurements and never infer identity, age, gender, ethnicity, emotion, health, or attractiveness. Permitted face geometry/quality: ${JSON.stringify(face)}. Exact shape: {params:{height:number,build:number,shoulders:number,skinTone:string,hairColor:string,hairStyle:string,presentation:string},summary:string}.`;
    const parsed = avatarSchema.parse(await this.converse(images, prompt));
    parsed.params.presentation = input.presentation;
    if (input.height !== undefined) parsed.params.height = input.height;
    return parsed;
  }

  async generatePreview(input: Parameters<AiService['generatePreview']>[0]): Promise<{ image: string; mimeType: string }> {
    let body: Record<string, unknown>;
    if (input.kind === 'hair') {
      body = { taskType: 'INPAINTING', inPaintingParams: { image: input.image.data, maskPrompt: 'hair', text: input.prompt }, imageGenerationConfig: { numberOfImages: 1, quality: 'standard', cfgScale: 6.5 } };
    } else {
      if (input.garmentImages?.length !== 1) throw new BedrockServiceError('INVALID_REQUEST', 'Nova Canvas virtual try-on requires exactly one garment image.', 400);
      body = { taskType: 'VIRTUAL_TRY_ON', virtualTryOnParams: { sourceImage: input.image.data, referenceImage: input.garmentImages[0].data, maskType: 'GARMENT', garmentBasedMask: { maskShape: 'DEFAULT', garmentClass: garmentClass(input.prompt) }, maskExclusions: { preserveBodyPose: 'ON', preserveHands: 'ON', preserveFace: 'ON' }, mergeStyle: 'BALANCED', returnMask: false }, imageGenerationConfig: { numberOfImages: 1, quality: 'standard', cfgScale: 6.5 } };
    }
    const response = await this.send(this.bedrock, new InvokeModelCommand({ modelId: this.config.imageModel, contentType: 'application/json', accept: 'application/json', body: new TextEncoder().encode(JSON.stringify(body)) })) as InvokeModelCommandOutput;
    const decoded = JSON.parse(await responseBody(response.body)) as { images?: unknown[]; error?: string };
    const image = decoded.images?.[0];
    if (typeof image !== 'string' || !image || image.length > 16 * 1024 * 1024) throw new BedrockServiceError('INVALID_PROVIDER_RESPONSE', 'Nova Canvas returned no usable image.', 502);
    return { image: `data:image/png;base64,${image}`, mimeType: 'image/png' };
  }

  private async converse(images: NormalizedImage[], prompt: string): Promise<unknown> {
    const content = [...images.map((image) => ({ image: { format: 'jpeg' as const, source: { bytes: Buffer.from(image.data, 'base64') } } })), { text: prompt }];
    const response = await this.send(this.bedrock, new ConverseCommand({ modelId: this.config.model, messages: [{ role: 'user', content }], inferenceConfig: { maxTokens: 3000, temperature: 0.25 } })) as ConverseCommandOutput;
    const text = response.output?.message?.content?.find((block) => 'text' in block)?.text;
    if (!text || text.length > 100_000) throw new BedrockServiceError('INVALID_PROVIDER_RESPONSE', 'Amazon Nova returned no usable structured response.', 502);
    try { return JSON.parse(text); } catch { throw new BedrockServiceError('INVALID_PROVIDER_RESPONSE', 'Amazon Nova returned malformed structured output.', 502); }
  }

  private async faceContext(image: NormalizedImage) {
    if (!this.rekognition) return undefined;
    const response = await this.send(this.rekognition, new DetectFacesCommand({ Image: { Bytes: Buffer.from(image.data, 'base64') }, Attributes: ['DEFAULT'] })) as DetectFacesCommandOutput;
    return response.FaceDetails?.slice(0, 1).map((face) => ({ Confidence: face.Confidence, BoundingBox: face.BoundingBox, Pose: face.Pose, Quality: face.Quality, Landmarks: face.Landmarks?.map(({ Type, X, Y }) => ({ Type, X, Y })) }));
  }

  private async send(client: SendClient, command: unknown) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 120_000);
    try { return await client.send(command, { abortSignal: controller.signal }); }
    catch (error) { throw normalizeAwsError(error); }
    finally { clearTimeout(timer); }
  }
}

function garmentClass(prompt: string) {
  const lower = prompt.toLowerCase();
  if (/full.?body|outfit/.test(lower)) return 'FULL_BODY';
  if (/shoe|boot|footwear/.test(lower)) return 'FOOTWEAR';
  if (/pant|trouser|short|skirt|lower/.test(lower)) return 'LOWER_BODY';
  if (/dress/.test(lower)) return 'FULL_BODY';
  return 'UPPER_BODY';
}

async function responseBody(body: InvokeModelCommandOutput['body']) {
  if (!body) throw new BedrockServiceError('INVALID_PROVIDER_RESPONSE', 'Nova Canvas returned an empty response.', 502);
  if ('transformToString' in body && typeof body.transformToString === 'function') return body.transformToString();
  return new TextDecoder().decode(body as Uint8Array);
}

function normalizeAwsError(error: unknown) {
  const value = error as { name?: string; code?: string; $metadata?: { httpStatusCode?: number } };
  const name = value.name ?? value.code ?? 'AWS_ERROR';
  const http = value.$metadata?.httpStatusCode;
  if (/AccessDenied|Unauthorized|UnrecognizedClient|InvalidSignature/i.test(name)) return new BedrockServiceError('AWS_ACCESS_DENIED', 'AWS AI service is not authorized.', 403);
  if (/Throttl|TooManyRequests|ServiceQuota/i.test(name)) return new BedrockServiceError('AWS_THROTTLED', 'AWS AI capacity is temporarily limited.', 429);
  if (/Abort/i.test(name)) return new BedrockServiceError('AWS_TIMEOUT', 'AWS AI request timed out.', 504);
  return new BedrockServiceError('AWS_ERROR', 'AWS AI service could not complete the request.', http && http >= 400 ? http : 502);
}
