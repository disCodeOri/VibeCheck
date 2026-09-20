import {describe,it,expect} from 'vitest';
import {chapters,chapterAt,clampTime,DEMO_DURATION} from '../src/demo/timeline';
import {photoPermission} from '../server/privacy';
describe('Recorded workflow',()=>{
 it('covers the entire video without gaps and stays under three minutes',()=>{expect(DEMO_DURATION).toBeLessThan(180);expect(chapters[0].start).toBe(0);chapters.forEach((c,i)=>{expect(c.end).toBeGreaterThan(c.start);if(i)expect(c.start).toBe(chapters[i-1].end);expect(chapterAt(c.start).id).toBe(c.id)});expect(chapters.at(-1)?.end).toBe(DEMO_DURATION)});
 it('handles seeking outside the video and its exact final frame',()=>{expect(clampTime(-1)).toBe(0);expect(clampTime(NaN)).toBe(0);expect(clampTime(999)).toBe(178);expect(chapterAt(178).id).toBe('outro')});
});
describe('Real Cedar policy',()=>{
 it.each(['analyze','compare','avatar'])('allows %s only while processing is enabled',action=>{expect(photoPermission(action,true,false).allowed).toBe(true);expect(photoPermission(action,false,false).allowed).toBe(false)});
 it('denies generation without explicit enablement and denies unknown actions',()=>{expect(photoPermission('generate-preview',true,false).allowed).toBe(false);expect(photoPermission('generate-preview',true,true).allowed).toBe(true);expect(photoPermission('generate-preview',false,true).allowed).toBe(false);expect(photoPermission('unrecognized',true,true).allowed).toBe(false)});
});
