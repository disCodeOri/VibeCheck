import { describe, expect, it } from 'vitest';
import { GeminiService } from '../server/gemini.js';

describe('GeminiService Multi-Key Failover', () => {
  it('instantiates correctly with single key or array of keys and comma strings', () => {
    const s1 = new GeminiService('key1, key2');
    expect((s1 as any).keys).toEqual(['key1', 'key2']);

    const s2 = new GeminiService(['key1', 'key2, key3']);
    expect((s2 as any).keys).toEqual(['key1', 'key2', 'key3']);
  });

  it('fails over to next key when the first key encounters rate limit (429) or error', async () => {
    const service = new GeminiService(['rate-limited-key', 'working-key']);
    const callLog: string[] = [];

    // Mock getClientForKey
    (service as any).getClientForKey = (key: string) => {
      return {
        models: {
          generateContent: async () => {
            callLog.push(key);
            if (key === 'rate-limited-key') {
              throw Object.assign(new Error('Quota exceeded'), { status: 429 });
            }
            return {
              text: JSON.stringify({
                score: 85,
                verdict: 'Great style',
                summary: 'Clear presentation.',
                metrics: [{ label: 'Style', score: 85, detail: 'Clean lines' }],
                tips: ['Keep it up'],
                source: 'gemini',
              }),
            };
          },
        },
      };
    };

    const pixel = 'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAEklEQVR4nGMwTptpnDaTAUIBAB/uBMmHTtWQAAAAAElFTkSuQmCC';
    const result = await service.analyze({
      kind: 'story',
      image: { data: pixel, mimeType: 'image/png' },
    });

    expect(result.score).toBe(85);
    expect(result.verdict).toBe('Great style');
    // First key was attempted, then failed over to working key
    expect(callLog).toEqual(['rate-limited-key', 'working-key']);
    // Active key should now be the working key
    expect((service as any).activeKeyIndex).toBe(1);

    // Second call should immediately use the working key without attempting the rate-limited one
    const secondResult = await service.analyze({
      kind: 'story',
      image: { data: pixel, mimeType: 'image/png' },
    });
    expect(secondResult.score).toBe(85);
    expect(callLog).toEqual(['rate-limited-key', 'working-key', 'working-key']);
  });

  it('throws error when all keys in the pool fail', async () => {
    const service = new GeminiService(['bad-key-1', 'bad-key-2']);
    (service as any).getClientForKey = (key: string) => ({
      models: {
        generateContent: async () => {
          throw Object.assign(new Error(`Failed with ${key}`), { status: 500 });
        },
      },
    });

    const pixel = 'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAEklEQVR4nGMwTptpnDaTAUIBAB/uBMmHTtWQAAAAAElFTkSuQmCC';
    await expect(
      service.analyze({
        kind: 'story',
        image: { data: pixel, mimeType: 'image/png' },
      })
    ).rejects.toThrow('Failed with bad-key-2');
  });
});
