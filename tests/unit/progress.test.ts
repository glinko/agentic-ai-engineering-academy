import {describe,it,expect} from 'vitest';
import {emptyProgress,initialExercise,loadProgress,saveProgress,recordAttempt} from '../../src/engine/progress';
describe('versioned progress',()=>{
 it('roundtrips code, hints, attempts, time and completion',()=>{let value='';const store={getItem:()=>value,setItem:(_k:string,v:string)=>{value=v;}};const p=emptyProgress();p.exercises.one={...initialExercise('print(1)'),hints:2,elapsed_seconds:30};p.exercises.one=recordAttempt(p.exercises.one,{stdout:'1',stderr:'',tests:[{name:'one',passed:true}],duration_ms:10},1);expect(saveProgress(p,store)).toBe(true);expect(loadProgress(store)).toEqual(p);});
 it('survives corrupt data and unavailable storage',()=>{expect(loadProgress({getItem:()=>'{broken'})).toEqual(emptyProgress());expect(loadProgress({getItem:()=>JSON.stringify({version:1,exercises:{x:{code:2}},theory_read:[]})})).toEqual(emptyProgress());expect(saveProgress(emptyProgress(),{setItem:()=>{throw Error('quota');}})).toBe(false);});
 it('keeps completion after repeating a task incorrectly',()=>{const p={...initialExercise('x=1'),completed:true};expect(recordAttempt(p,{stdout:'',stderr:'',tests:[{name:'x',passed:false}],duration_ms:1},1).completed).toBe(true);});
});
