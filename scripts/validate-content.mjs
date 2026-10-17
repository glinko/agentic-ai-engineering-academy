import {loadPyodide} from 'pyodide';
import {readFile} from 'node:fs/promises';
import {buildHarness} from '../src/engine/harness.ts';
const exercises=JSON.parse(await readFile('src/content/exercises.json','utf8'));
const solutions=JSON.parse(await readFile('src/content/solutions.json','utf8'));
const py=await loadPyodide();
let total=0;
for(const catalog of [exercises,JSON.parse(await readFile('src/content/en/exercises.json','utf8'))])for(const exercise of catalog){
 const globals=py.runPython('dict()');
 const result=JSON.parse(await py.runPythonAsync(buildHarness(solutions[exercise.id],exercise.public_tests),{globals}));globals.destroy();
 if(result.error||result.tests.some(t=>!t.passed)||result.tests.length!==exercise.public_tests.length)throw Error(exercise.id+': '+JSON.stringify(result));
 total+=result.tests.length;
}
for(const [code,kind] of [['if True print(1)','syntax'],['raise ValueError("oops")','runtime']]){
 const result=JSON.parse(await py.runPythonAsync(buildHarness(code,[])));
 if(result.kind!==kind)throw Error(`Expected ${kind}: ${JSON.stringify(result)}`);
}
const wrong=JSON.parse(await py.runPythonAsync(buildHarness(solutions['variables-1'].replace("'Research'","'Wrong'"),exercises[0].public_tests)));
if(wrong.tests.every(t=>t.passed))throw Error('Wrong solution accepted');
console.log(`PASS: 15 reference solutions in 2 languages, ${total} test executions, syntax/runtime errors and wrong answer (real Pyodide).`);
