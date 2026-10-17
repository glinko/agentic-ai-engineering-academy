import type {Progress,ExerciseProgress,ExecutionResult} from '../types';
import {isSuccessful} from './runner';
export const STORAGE_KEY='agentic-academy.progress.v1';
export const emptyProgress=():Progress=>({version:1,exercises:{},theory_read:[]});
export const initialExercise=(code:string):ExerciseProgress=>({code,hints:0,attempts:[],completed:false,elapsed_seconds:0});
export function loadProgress(storage:Pick<Storage,'getItem'>=localStorage):Progress {
 try {const raw=storage.getItem(STORAGE_KEY);if(!raw)return emptyProgress();const p=JSON.parse(raw);
 if(p.version!==1||!p.exercises||typeof p.exercises!=='object'||!Array.isArray(p.theory_read))return emptyProgress();
 for(const e of Object.values(p.exercises) as ExerciseProgress[])if(!e||typeof e.code!=='string'||typeof e.hints!=='number'||!Array.isArray(e.attempts)||typeof e.completed!=='boolean'||!Number.isFinite(e.elapsed_seconds))return emptyProgress();
 return p;
 }catch{return emptyProgress();}
}
export function saveProgress(p:Progress,storage:Pick<Storage,'setItem'>=localStorage):boolean {try{storage.setItem(STORAGE_KEY,JSON.stringify(p));return true;}catch{return false;}}
export function recordAttempt(p:ExerciseProgress,result:ExecutionResult,expected:number):ExerciseProgress {
 const passed=isSuccessful(result,expected);
 return {...p,completed:p.completed||passed,review_at:passed?new Date(Date.now()+86400000).toISOString():p.review_at,attempts:[...p.attempts,{at:new Date().toISOString(),passed,tests:result.tests,error:result.error,duration_ms:result.duration_ms}].slice(-100)};
}
