import {describe,it,expect,vi,afterEach} from 'vitest';
import {PythonRunner,isSuccessful,type WorkerLike} from '../../src/engine/runner';
class FakeWorker implements WorkerLike {
 onmessage:((e:MessageEvent)=>void)|null=null;onerror:((e:ErrorEvent)=>void)|null=null;postMessage=vi.fn();terminate=vi.fn();
 send(data:unknown){this.onmessage?.({data} as MessageEvent);}
}
describe('Python worker lifecycle',()=>{
 afterEach(()=>vi.useRealTimers());
 it('starts deadline only after Python is ready and returns structured result',async()=>{const w=new FakeWorker();const runner=new PythonRunner(()=>w);const task=runner.run('print(1)');w.send({type:'ready'});expect(w.postMessage).toHaveBeenCalledOnce();const result={stdout:'1',stderr:'',tests:[],duration_ms:2};w.send({type:'result',result});expect(await task).toEqual(result);expect(w.terminate).toHaveBeenCalledOnce();});
 it('terminates infinite execution and permits a fresh run',async()=>{vi.useFakeTimers();let w=new FakeWorker();const runner=new PythonRunner(()=>w,50);const task=runner.run('while True: pass');w.send({type:'ready'});await vi.advanceTimersByTimeAsync(51);expect((await task).kind).toBe('timeout');expect(w.terminate).toHaveBeenCalledOnce();w=new FakeWorker();const task2=runner.run('print(2)');w.send({type:'ready'});w.send({type:'result',result:{stdout:'2',stderr:'',tests:[],duration_ms:1}});expect((await task2).stdout).toBe('2');});
 it('resolves cancellation and initialization errors',async()=>{const w=new FakeWorker();const runner=new PythonRunner(()=>w);const task=runner.run('x');runner.dispose();expect((await task).kind).toBe('timeout');const task2=runner.run('x');w.send({type:'init-error',error:'unavailable'});expect((await task2).kind).toBe('infrastructure');});
 it('does not accept empty or incomplete test results',()=>{expect(isSuccessful({stdout:'',stderr:'',tests:[],duration_ms:0},3)).toBe(false);expect(isSuccessful({stdout:'',stderr:'',tests:[{name:'one',passed:true}],duration_ms:0},3)).toBe(false);});
});
