import {cp,mkdir} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const source=dirname(require.resolve('pyodide/package.json'));
await mkdir('public/pyodide',{recursive:true});
for(const file of ['pyodide.js','pyodide.asm.js','pyodide.asm.wasm','python_stdlib.zip','pyodide-lock.json']) {
 await cp(resolve(source,file),resolve('public/pyodide',file));
}
console.log('Python runtime copied to public/pyodide (self-hosted, no CDN).');
