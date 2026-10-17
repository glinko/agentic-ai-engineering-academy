import {buildHarness} from './harness';
import type {ExecutionResult, TestCase} from '../types';
export interface WorkerLike {onmessage:((e:MessageEvent)=>void)|null;onerror:((e:ErrorEvent)=>void)|null;postMessage(data:unknown):void;terminate():void}
export class PythonRunner {
 private active?:WorkerLike;
 private cancel?:()=>void;
 constructor(private factory:()=>WorkerLike=()=>new Worker('/python-worker.js'), private executionLimit=5000, private initializationLimit=60000){}
 run(code:string,tests:TestCase[]=[],onReady?:()=>void):Promise<ExecutionResult> {
  this.dispose();
  return new Promise(resolve=>{
   const started=Date.now();
   let timer:ReturnType<typeof setTimeout>;
   let worker:WorkerLike;
   let settled=false;
   const finish=(result:ExecutionResult)=>{if(settled)return;settled=true;clearTimeout(timer);worker?.terminate();this.active=undefined;this.cancel=undefined;resolve(result);};
   const failure=(error:string,kind:ExecutionResult['kind'])=>finish({stdout:'',stderr:'',tests:[],error,kind,duration_ms:Date.now()-started});
   try { worker=this.factory();this.active=worker; } catch(e){failure(String(e),'infrastructure');return;}
   this.cancel=()=>failure('Execution stopped. The environment has been reset.','timeout');
   timer=setTimeout(()=>failure('Python did not load within 60 seconds. Check that /pyodide/ files are available.','infrastructure'),this.initializationLimit);
   worker.onmessage=({data})=>{
    if(data.type==='ready') {clearTimeout(timer);onReady?.();timer=setTimeout(()=>failure('Execution time limit exceeded. Check the loop termination condition.','timeout'),this.executionLimit);worker.postMessage({source:buildHarness(code,tests)});}
    else if(data.type==='result') finish(data.result);
    else if(data.type==='init-error'||data.type==='error') failure(data.error,'infrastructure');
   };
   worker.onerror=e=>failure(e.message||'Failed to load the Python Worker.','infrastructure');
  });
 }
 dispose(){this.cancel?.();this.active?.terminate();this.active=undefined;}
}
export function isSuccessful(result:ExecutionResult,expectedCount:number){return !result.error && expectedCount>0 && result.tests.length===expectedCount && result.tests.every(t=>t.passed);}
