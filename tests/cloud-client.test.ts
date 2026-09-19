import {describe,it,expect} from 'vitest';
import {prepareCloudImages,mapStateImages} from '../src/lib/cloud';
import {defaultState,sampleGarments,exampleAnalysis} from '../src/lib/storage';

describe('cloud image serialization',()=>{
 it('uploads only documented photo inputs and preserves context',async()=>{
  const seen:string[]=[];const output=await prepareCloudImages({image:'photo',imageB:'second',referenceImages:['ref'],garmentImages:['shirt'],prompt:'leave this unchanged',height:175},async image=>{seen.push(image);return `users/id/images/${image}.jpg`});
  expect(seen).toEqual(['photo','second','ref','shirt']);expect(output.prompt).toBe('leave this unchanged');expect(output.height).toBe(175);expect(output.referenceImages).toEqual(['users/id/images/ref.jpg']);
 });
 it('preserves all state and maps every stored image including saved previews',async()=>{
  const original=defaultState();original.profile.photo='face';original.profile.bodyPhoto='body';original.garments=sampleGarments().slice(0,1);original.saved=[{id:'saved',kind:'story',title:'photo is a caption',image:'result',secondaryImage:'preview',analysis:exampleAnalysis,createdAt:10}];
  const result=await mapStateImages(original,async src=>`mapped:${src}`);
  expect(result.profile.photo).toBe('mapped:face');expect(result.profile.bodyPhoto).toBe('mapped:body');expect(result.garments[0].image).toBe('mapped:/assets/garments.png#0');expect(result.saved[0].secondaryImage).toBe('mapped:preview');expect(result.saved[0].title).toBe(original.saved[0].title);expect(original.profile.photo).toBe('face');expect(result.saved[0].analysis).toEqual(exampleAnalysis);
 });
});
