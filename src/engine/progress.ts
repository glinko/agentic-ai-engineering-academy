import type {Progress,ExerciseProgress,ExecutionResult,Lesson} from '../types';
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
 return {...p,completed:p.completed||passed,completion_source:passed?'tests':p.completion_source,review_at:passed?new Date(Date.now()+86400000).toISOString():p.review_at,attempts:[...p.attempts,{at:new Date().toISOString(),passed,tests:result.tests,error:result.error,duration_ms:result.duration_ms}].slice(-100)};
}
export function parseResumeCount(value:string|null,lessonCount:number):number|null {
 if(!value||!/^\d+$/.test(value))return null;
 const count=Number(value);
 return Number.isSafeInteger(count)&&count>0&&count<lessonCount?count:null;
}
// Self-reported learning from another origin/device. Never invent test attempts.
export function restoreCompletedLessons(progress:Progress,lessons:Lesson[],count:number):Progress {
 if(parseResumeCount(String(count),lessons.length)===null)return progress;
 const exercises={...progress.exercises};
 for(const lesson of lessons.slice(0,count))for(const exercise of lesson.exercises){
  const previous=exercises[exercise.id]??initialExercise(exercise.starter_code);
  exercises[exercise.id]={...previous,completed:true,completion_source:previous.completed?previous.completion_source:'restored'};
 }
 return {...progress,exercises,theory_read:[...new Set([...progress.theory_read,...lessons.slice(0,count).map(l=>l.id)])],last_exercise:lessons[count].exercises[0].id};
}
