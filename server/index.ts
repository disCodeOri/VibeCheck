import dotenv from 'dotenv';
dotenv.config({ path: '.env.local', quiet: true });

import { createApp } from './app.js';
import { GeminiService } from './gemini.js';
import { BedrockService } from './bedrock.js';

const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY ?? '';
const provider=process.env.AI_PROVIDER==='bedrock'?'bedrock':'gemini';
const model = provider==='bedrock'?process.env.BEDROCK_MODEL??'us.amazon.nova-lite-v1:0':process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';
const imageModel = provider==='bedrock'?process.env.BEDROCK_IMAGE_MODEL??'amazon.nova-canvas-v1:0':process.env.GEMINI_IMAGE_MODEL ?? 'gemini-2.5-flash-image';
const service = provider==='bedrock'?new BedrockService({region:process.env.AWS_REGION||'us-east-1',model,imageModel,useRekognition:process.env.USE_REKOGNITION==='true'}):new GeminiService(apiKey, model, imageModel);
const port = Number(process.env.PORT ?? 8787);

createApp(service, { configured: provider==='bedrock'||Boolean(apiKey), provider, model, imageModel }).listen(port, '127.0.0.1', () => {
  console.log(`VibeCheck API listening on http://127.0.0.1:${port}`);
});
