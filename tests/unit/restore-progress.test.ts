import {describe,it,expect} from 'vitest';
import {getContent} from '../../src/content';
import {emptyProgress,initialExercise,parseResumeCount,restoreCompletedLessons,recordAttempt,saveProgress,loadProgress} from '../../src/engine/progress';
const {lessons}=getContent('en');
describe('restore learning on another device',()=>{
 it('accepts only a valid number of previously completed lessons',()=>{expect(parseResumeCount('4',5)).toBe(4);for(const value of [null,'','0','5','-1','1.2','Infinity','4x'])expect(parseResumeCount(value,5)).toBeNull();});
 it('restores the first four lessons without inventing tests or touching the fifth',()=>{
  const p=emptyProgress();p.exercises['variables-1']={...initialExercise('my draft'),hints:2,elapsed_seconds:80};p.exercises['collections-1']=initialExercise('fifth lesson draft');
  const restored=restoreCompletedLessons(p,lessons,4);
  expect(Object.values(restored.exercises).filter(e=>e.completed)).toHaveLength(12);
  expect(restored.exercises['variables-1']).toMatchObject({code:'my draft',hints:2,elapsed_seconds:80,attempts:[],completion_source:'restored'});
  expect(restored.exercises['collections-1']).toEqual(p.exercises['collections-1']);expect(restored.last_exercise).toBe('collections-1');expect(p.exercises['variables-1'].completed).toBe(false);
  expect(restoreCompletedLessons(restored,lessons,4)).toEqual(restored);
  let saved='';const store={getItem:()=>saved,setItem:(_key:string,value:string)=>{saved=value;}};saveProgress(restored,store);expect(loadProgress(store)).toEqual(restored);
 });
 it('a real successful check replaces restored completion provenance',()=>{
  const p={...initialExercise('x=1'),completed:true,completion_source:'restored' as const};
  expect(recordAttempt(p,{stdout:'',stderr:'',tests:[{name:'real check',passed:true}],duration_ms:1},1).completion_source).toBe('tests');
 });
});
