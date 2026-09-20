import { afterEach, describe, expect, it } from 'vitest';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { createApp, type AiService } from '../server/app.js';
import type { Analysis, AvatarParams, CompareResult } from '../shared/types.js';

const pixel = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAEklEQVR4nGMwTptpnDaTAUIBAB/uBMmHTtWQAAAAAElFTkSuQmCC';
const analysis: Analysis = {
  score: 78,
  verdict: 'Strong framing',
  summary: 'The subject is clear and the background is calm.',
  metrics: [{ label: 'Composition', score: 81, detail: 'Balanced subject placement.' }],
  tips: ['Raise the camera slightly to create more space above the head.'],
  callouts: [{ label: 'Headroom', detail: 'A little tight.', x: 50, y: 12 }],
  source: 'gemini',
};

class FakeAi implements AiService {
  analyzeCalls = 0;
  async analyze(): Promise<Analysis> { this.analyzeCalls++; return analysis; }
  async compare(): Promise<CompareResult> { return { winner: 'a', summary: 'A has cleaner framing.', a: analysis, b: analysis, source: 'gemini' }; }
  async avatar(): Promise<{ params: AvatarParams; summary: string }> {
    return { params: { height: 172, build: 0.5, shoulders: 0.5, skinTone: '#a76f4f', hairColor: '#24160f', hairStyle: 'short', presentation: 'neutral' }, summary: 'Approximate visible traits were used.' };
  }
  async generatePreview(): Promise<{ image: string; mimeType: string }> { return { image: pixel, mimeType: 'image/png' }; }
}

const servers: Server[] = [];
async function start(ai: AiService, options: Parameters<typeof createApp>[1] = {}) {
  const server = createApp(ai, options).listen(0, '127.0.0.1');
  servers.push(server);
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const { port } = server.address() as AddressInfo;
  return `http://127.0.0.1:${port}`;
}
afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => new Promise<void>((resolve) => server.close(() => resolve()))));
});

describe('VibeCheck API', () => {
  it('enforces the Cedar pause before any provider call, then allows resuming', async()=>{
    const ai=new FakeAi(),base=await start(ai,{generationEnabled:false});
    const post=(path:string,body:unknown)=>fetch(base+path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
    expect((await post('/api/privacy',{processingEnabled:false})).status).toBe(200);
    for(const route of ['analyze','compare','avatar','generate-preview'])expect((await post('/api/'+route,{})).status).toBe(403);
    expect(ai.analyzeCalls).toBe(0);
    const proof=await (await fetch(base+'/api/privacy/proof')).json();
    expect(proof.enabled.allowed).toBe(true);expect(proof.paused.allowed).toBe(false);
    expect((await (await fetch(base+'/api/privacy')).json()).processingEnabled).toBe(false);
    await post('/api/privacy',{processingEnabled:true});
    expect((await post('/api/analyze',{kind:'story',image:pixel})).status).toBe(200);
    expect(ai.analyzeCalls).toBe(1);
    expect((await post('/api/generate-preview',{image:pixel,kind:'hair',prompt:'Hair'})).status).toBe(403);
  });
  it('reports provider configuration without exposing credentials', async () => {
    const base = await start(new FakeAi(), { configured: true, model: 'analysis-model', imageModel: 'image-model' });
    const response = await fetch(`${base}/api/health`);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ configured: true, model: 'analysis-model', imageModel: 'image-model', provider: 'gemini' });
  });

  it('normalizes an image and returns a validated analysis', async () => {
    const ai = new FakeAi();
    const base = await start(ai);
    const response = await fetch(`${base}/api/analyze`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ kind: 'loox', image: pixel }) });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(analysis);
    expect(ai.analyzeCalls).toBe(1);
  });

  it.each([
    ['remote URL', { kind: 'story', image: 'https://example.com/a.png' }],
    ['corrupt bytes', { kind: 'story', image: 'data:image/png;base64,bm90LWltYWdl' }],
    ['too many references', { kind: 'story', image: pixel, referenceImages: [pixel, pixel, pixel, pixel] }],
  ])('rejects %s before invoking AI', async (_name, body) => {
    const ai = new FakeAi();
    const base = await start(ai);
    const response = await fetch(`${base}/api/analyze`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: { code: 'INVALID_REQUEST' } });
    expect(ai.analyzeCalls).toBe(0);
  });

  it('rejects more than five garment images', async () => {
    const base = await start(new FakeAi());
    const response = await fetch(`${base}/api/generate-preview`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ image: pixel, kind: 'outfit', prompt: 'Use the jacket', garmentImages: Array(6).fill(pixel) }) });
    expect(response.status).toBe(400);
  });

  it('compares two normalized images', async () => {
    const base = await start(new FakeAi());
    const response = await fetch(`${base}/api/compare`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ imageA: pixel, imageB: pixel, mood: 'confident' }) });
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ winner: 'a', source: 'gemini' });
  });

  it('rejects requests from non-local browser origins', async () => {
    const base = await start(new FakeAi());
    const response = await fetch(`${base}/api/analyze`, { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://attacker.example' }, body: JSON.stringify({ kind: 'loox', image: pixel }) });
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: { code: 'ORIGIN_DENIED', message: 'This origin is not allowed.' } });
  });

  it('uses a supplied height while keeping avatar output bounded', async () => {
    const base = await start(new FakeAi());
    const response = await fetch(`${base}/api/avatar`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ image: pixel, presentation: 'neutral', height: 184 }) });
    expect(response.status).toBe(200);
    const payload = await response.json() as { params: AvatarParams };
    expect(payload.params.height).toBe(184);
    expect(payload.params.build).toBeGreaterThanOrEqual(0);
    expect(payload.params.build).toBeLessThanOrEqual(1);
  });

  it('rate limits repeated requests with a structured retry hint', async () => {
    const base = await start(new FakeAi(), { rateLimit: { max: 1, windowMs: 60_000 } });
    const init = { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ kind: 'loox', image: pixel }) };
    expect((await fetch(`${base}/api/analyze`, init)).status).toBe(200);
    const response = await fetch(`${base}/api/analyze`, init);
    expect(response.status).toBe(429);
    expect(await response.json()).toMatchObject({ error: { code: 'RATE_LIMITED', retryAfter: expect.any(Number) } });
  });

  it('sanitizes provider failures', async () => {
    const ai = new FakeAi();
    ai.analyze = async () => { throw Object.assign(new Error('provider secret response'), { code: 'INVALID_API_KEY' }); };
    const base = await start(ai);
    const response = await fetch(`${base}/api/analyze`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ kind: 'loox', image: pixel }) });
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: { code: 'AI_UNAVAILABLE', message: 'AI service is not configured or authorized.' } });
  });

  it('surfaces unsupported image generation without inventing output', async () => {
    const ai = new FakeAi();
    ai.generatePreview = async () => { throw Object.assign(new Error('provider detail'), { code: 'UNSUPPORTED_GENERATION' }); };
    const base = await start(ai);
    const response = await fetch(`${base}/api/generate-preview`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ image: pixel, kind: 'hair', prompt: 'Preview a textured crop' }) });
    expect(response.status).toBe(501);
    expect(await response.json()).toEqual({ error: { code: 'UNSUPPORTED_GENERATION', message: 'Image generation is not supported by the configured model.' } });
  });
});
