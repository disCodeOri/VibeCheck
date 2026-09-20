import 'fake-indexeddb/auto';
import { describe, it, expect } from 'vitest';
import { readState, writeState, validateBackup, defaultState } from '../src/lib/storage';
describe('device storage', () => {
  it('persists wardrobe and saved records across reads', async () => {
    const state = defaultState(); state.profile.name = 'Arjun';
    state.garments.push({id:'test',name:'Jacket',category:'layers',color:'#112233',image:'/assets/garments-soft.png#1',createdAt:1});
    await writeState(state); expect((await readState()).profile.name).toBe('Arjun');
    expect((await readState()).garments.find(g=>g.id==='test')?.name).toBe('Jacket');
  });
  it('rejects malicious image references and corrupted backups', () => {
    expect(()=>validateBackup({version:1,state:{}})).toThrow();
    const state=defaultState();state.profile.photo='javascript:alert(1)';
    expect(()=>validateBackup({version:1,state})).toThrow();
  });
  it('accepts only valid versioned exports', () => {
    expect(validateBackup({version:1,state:defaultState()}).profile.name).toBe('');
    expect(()=>validateBackup({version:7,state:defaultState()})).toThrow();
  });
});
