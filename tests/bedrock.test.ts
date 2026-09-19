import { describe, expect, it } from 'vitest';
import { BedrockService } from '../server/bedrock.js';
import type { NormalizedImage } from '../server/app.js';

const image: NormalizedImage = { data: Buffer.from('jpeg-bytes').toString('base64'), mimeType: 'image/jpeg' };
const validAnalysis = {
  score: 82, verdict: 'Strong presentation', summary: 'Clear subject and balanced framing.',
  metrics: [{ label: 'Composition', score: 84, detail: 'Subject is placed well.' }, { label: 'Style', score: 80, detail: 'Colors coordinate clearly.' }],
  tips: ['Add a little headroom.'], callouts: [{ label: 'Framing', detail: 'Close crop.', x: 50, y: 8 }], source: 'bedrock',
};

class FakeBedrock {
  commands: Array<{ constructor: { name: string }; input: Record<string, unknown> }> = [];
  constructor(private output: unknown) {}
  async send(command: { constructor: { name: string }; input: Record<string, unknown> }) { this.commands.push(command); return this.output; }
}
class FakeRekognition {
  commands: Array<{ input: Record<string, unknown> }> = [];
  async send(command: { input: Record<string, unknown> }) {
    this.commands.push(command);
    return { FaceDetails: [{ Confidence: 99, Quality: { Brightness: 73, Sharpness: 88 }, Pose: { Yaw: 2 }, Landmarks: [{ Type: 'eyeLeft', X: 0.4, Y: 0.35 }] }] };
  }
}
function textResponse(value: unknown) { return { output: { message: { content: [{ text: JSON.stringify(value) }] } } }; }
function service(output: unknown, rekognition?: FakeRekognition) {
  const bedrock = new FakeBedrock(output);
  return { bedrock, value: new BedrockService({ region: 'us-east-1', model: 'amazon.nova-lite-v1:0', imageModel: 'amazon.nova-canvas-v1:0', useRekognition: Boolean(rekognition) }, { bedrock: bedrock as never, rekognition: rekognition as never }) };
}

describe('BedrockService', () => {
  it('sends Nova Converse image bytes and validates analysis output', async () => {
    const { bedrock, value } = service(textResponse(validAnalysis));
    const result = await value.analyze({ kind: 'story', image, mood: 'confident' });
    expect(result).toEqual(validAnalysis);
    const input = bedrock.commands[0].input as any;
    expect(bedrock.commands[0].constructor.name).toBe('ConverseCommand');
    expect(input.modelId).toBe('amazon.nova-lite-v1:0');
    expect(input.messages[0].content[0].image.format).toBe('jpeg');
    expect(Buffer.from(input.messages[0].content[0].image.source.bytes).toString()).toBe('jpeg-bytes');
  });

  it('asks story analysis to use references as visual patterns and return captions', async () => {
    const story = { ...validAnalysis, captions: ['Clean lines, clear mood.'] };
    const { bedrock, value } = service(textResponse(story));
    await value.analyze({ kind: 'story', image, referenceImages: [image] });
    const prompt = (bedrock.commands[0].input as any).messages[0].content.at(-1).text as string;
    expect(prompt).toContain('reference images');
    expect(prompt).toContain('visual patterns');
    expect(prompt).toContain('captions:string[]');
  });

  it('requests every required nested analysis field when comparing', async () => {
    const compared = { winner: 'a', summary: 'A is stronger.', a: validAnalysis, b: validAnalysis, styleMatch: 75, source: 'bedrock' };
    const { bedrock, value } = service(textResponse(compared));
    await value.compare({ imageA: image, imageB: image, referenceImages: [image] });
    const prompt = (bedrock.commands[0].input as any).messages[0].content.at(-1).text as string;
    expect(prompt).toContain('score,verdict,summary,metrics');
    expect(prompt).toContain('optional reference images');
    expect(prompt).toContain('captions?:string[]');
  });

  it('states numeric, color, and enum bounds in the avatar prompt', async () => {
    const avatar = { params: { height: 172, build: 0.5, shoulders: 0.5, skinTone: '#a06b4f', hairColor: '#24160f', hairStyle: 'short', presentation: 'neutral' }, summary: 'Approximate visible settings.' };
    const { bedrock, value } = service(textResponse(avatar));
    await value.avatar({ image, presentation: 'neutral' });
    const prompt = (bedrock.commands[0].input as any).messages[0].content.at(-1).text as string;
    expect(prompt).toContain('height 145-205');
    expect(prompt).toContain('#RRGGBB');
    expect(prompt).toContain('short|medium|long');
  });

  it('uses only Rekognition DEFAULT attributes and includes permitted face geometry in the prompt', async () => {
    const rekognition = new FakeRekognition();
    const { bedrock, value } = service(textResponse(validAnalysis), rekognition);
    await value.analyze({ kind: 'loox', image });
    expect((rekognition.commands[0].input as any).Attributes).toEqual(['DEFAULT']);
    expect((rekognition.commands[0].input as any).Image.Bytes).toBeInstanceOf(Uint8Array);
    const prompt = JSON.stringify((bedrock.commands[0].input as any).messages);
    expect(prompt).toContain('Sharpness');
    expect(prompt).not.toContain('Gender');
    expect(prompt).not.toContain('Emotions');
  });

  it('rejects malformed model JSON instead of fabricating an analysis', async () => {
    const { value } = service(textResponse({ score: 999, source: 'bedrock' }));
    await expect(value.analyze({ kind: 'story', image })).rejects.toThrow();
  });

  it('builds Nova Canvas hair inpainting with a hair mask prompt', async () => {
    const encoded = Buffer.from('png-output').toString('base64');
    const { bedrock, value } = service({ body: new TextEncoder().encode(JSON.stringify({ images: [encoded] })) });
    const result = await value.generatePreview({ image, kind: 'hair', prompt: 'textured crop' });
    const input = bedrock.commands[0].input as any;
    const body = JSON.parse(new TextDecoder().decode(input.body));
    expect(body).toMatchObject({ taskType: 'INPAINTING', inPaintingParams: { maskPrompt: 'hair', text: 'textured crop' } });
    expect(result).toEqual({ image: `data:image/png;base64,${encoded}`, mimeType: 'image/png' });
  });

  it('builds a real one-garment virtual try-on request', async () => {
    const encoded = Buffer.from('png-output').toString('base64');
    const { bedrock, value } = service({ body: new TextEncoder().encode(JSON.stringify({ images: [encoded] })) });
    await value.generatePreview({ image, kind: 'outfit', prompt: 'upper body jacket', garmentImages: [image] });
    const body = JSON.parse(new TextDecoder().decode((bedrock.commands[0].input as any).body));
    expect(body.taskType).toBe('VIRTUAL_TRY_ON');
    expect(body.virtualTryOnParams).toMatchObject({ sourceImage: image.data, referenceImage: image.data, maskType: 'GARMENT', garmentBasedMask: { garmentClass: 'UPPER_BODY' }, maskExclusions: { preserveFace: 'ON', preserveHands: 'ON', preserveBodyPose: 'ON' } });
    expect(body.virtualTryOnParams).not.toHaveProperty('text');
  });

  it('rejects zero or multiple outfit garments instead of pretending all were applied', async () => {
    const { value } = service({});
    await expect(value.generatePreview({ image, kind: 'outfit', prompt: 'jacket' })).rejects.toMatchObject({ code: 'INVALID_REQUEST' });
    await expect(value.generatePreview({ image, kind: 'outfit', prompt: 'jacket', garmentImages: [image, image] })).rejects.toMatchObject({ code: 'INVALID_REQUEST' });
  });

  it('rejects missing Canvas image output', async () => {
    const { value } = service({ body: new TextEncoder().encode(JSON.stringify({ images: [] })) });
    await expect(value.generatePreview({ image, kind: 'hair', prompt: 'crop' })).rejects.toMatchObject({ code: 'INVALID_PROVIDER_RESPONSE' });
  });
});
