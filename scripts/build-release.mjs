import {cp,mkdir,readFile,writeFile,readdir,lstat} from 'node:fs/promises';
import {resolve,join,basename} from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';

const version=JSON.parse(await readFile('package.json','utf8')).version;
if(!/^\d+\.\d+\.\d+$/.test(version))throw Error('Release version must be semver');
const output=resolve('.release');
const stage=join(output,`build-${Date.now()}`);
await mkdir(join(output,'downloads'),{recursive:true});
const runtimeVersion='3.14.8';
const runtimeSha='a93abe456ab01bd96d7a085b3cdb6566b3063f4241360d114142fbdb07f0a310';
const runtimeFile=join(output,'downloads',`python-${runtimeVersion}-embed-amd64.zip`);
const hash=data=>createHash('sha256').update(data).digest('hex');
let runtime;
try{runtime=await readFile(runtimeFile);}catch{
 const response=await fetch(`https://www.python.org/ftp/python/${runtimeVersion}/${basename(runtimeFile)}`);
 if(!response.ok)throw Error(`Python download failed: ${response.status}`);
 runtime=Buffer.from(await response.arrayBuffer());
 if(hash(runtime)!==runtimeSha)throw Error('Official Python archive checksum mismatch');
 await writeFile(runtimeFile,runtime);
}
if(hash(runtime)!==runtimeSha)throw Error('Cached Python archive checksum mismatch');
function command(binary,args){const result=spawnSync(binary,args,{encoding:'utf8'});if(result.status!==0)throw Error(result.stderr||`${binary} failed`);}

// Include license notices for installed npm packages (a superset of bundled code).
const licenseStage=join(stage,'licenses');
await mkdir(licenseStage,{recursive:true});
const notices=['# Third-party notices','','The Academy project is MIT licensed. Bundled third-party components retain their own licenses.','',`Windows Python ${runtimeVersion}: https://www.python.org/downloads/release/python-${runtimeVersion.replaceAll('.','')}/ (runtime/LICENSE.txt).`,'','Pyodide 0.28.3 is MPL-2.0. Its unmodified source is available at https://github.com/pyodide/pyodide/tree/0.28.3.','The browser Python standard library retains the Python license; a copy is included in licenses/.','','## npm dependency notices',''];
const seen=new Set();
async function collect(directory){
 let pkg;try{pkg=JSON.parse(await readFile(join(directory,'package.json'),'utf8'));}catch{return;}
 const key=`${pkg.name}@${pkg.version}`;if(seen.has(key))return;seen.add(key);
 const folder=key.replaceAll(/[^A-Za-z0-9._-]/g,'_');
 notices.push(`- ${key}: ${typeof pkg.license==='string'?pkg.license:JSON.stringify(pkg.license??'See upstream package')}`);
 for(const entry of await readdir(directory,{withFileTypes:true})){
  if(entry.isFile()&&/^(license|licence|notice|copying)(\.|$)/i.test(entry.name)){
   await mkdir(join(licenseStage,folder),{recursive:true});
   await cp(join(directory,entry.name),join(licenseStage,folder,entry.name));
  }
 }
}
for(const entry of await readdir('node_modules/.pnpm',{withFileTypes:true})){
 if(!entry.isDirectory())continue;
 const modules=join('node_modules/.pnpm',entry.name,'node_modules');
 let entries;try{entries=await readdir(modules,{withFileTypes:true});}catch{continue;}
 for(const dependency of entries){
  if(!dependency.isDirectory())continue;
  const directory=join(modules,dependency.name);
  if(dependency.name.startsWith('@'))for(const scoped of await readdir(directory,{withFileTypes:true})){if(scoped.isDirectory())await collect(join(directory,scoped.name));}
  else await collect(directory);
 }
}
const pyodideLicense=await fetch('https://raw.githubusercontent.com/pyodide/pyodide/0.28.3/LICENSE');
if(!pyodideLicense.ok)throw Error('Cannot retrieve Pyodide license');
await writeFile(join(licenseStage,'pyodide-MPL-2.0.txt'),await pyodideLicense.text());
const windows=join(stage,'windows','agentic-academy'),ubuntu=join(stage,'ubuntu','agentic-academy');
for(const root of [windows,ubuntu]){
 await mkdir(root,{recursive:true});
 await cp('dist',join(root,'dist'),{recursive:true});
 await cp('portable',root,{recursive:true});
 await cp('LICENSE',join(root,'LICENSE'));
 await cp(licenseStage,join(root,'licenses'),{recursive:true});
 await mkdir(join(root,'metadata'));
 for(const language of ['en','ru'])await cp(`backend/curriculum.${language}.json`,join(root,'metadata',`curriculum.${language}.json`));
 await writeFile(join(root,'version.json'),JSON.stringify({version})+'\n');
 await writeFile(join(root,'THIRD_PARTY_NOTICES.md'),notices.join('\n')+'\n');
}
await mkdir(join(windows,'runtime'));
command('tar',['-xf',runtimeFile,'-C',join(windows,'runtime')]);
for(const root of [windows,ubuntu])await cp(join(windows,'runtime','LICENSE.txt'),join(root,'licenses','python-license.txt'));
const windowsName=`agentic-academy-v${version}-windows-x64.zip`,ubuntuName=`agentic-academy-v${version}-ubuntu.tar.gz`;
command('tar',['-a','-cf',join(output,windowsName),'-C',join(stage,'windows'),'agentic-academy']);
command('tar',['-czf',join(output,ubuntuName),'-C',join(stage,'ubuntu'),'agentic-academy']);
await cp('install/ubuntu.sh',join(output,'install-ubuntu.sh'));
const assets=[windowsName,ubuntuName,'install-ubuntu.sh'];
const checksums=[];
for(const name of assets){const data=await readFile(join(output,name));checksums.push(`${hash(data)}  ${name}`);console.log(`${name}: ${(data.length/1024/1024).toFixed(1)} MiB`);}
await writeFile(join(output,'SHA256SUMS'),checksums.join('\n')+'\n');
await writeFile(join(output,'build.json'),JSON.stringify({version,windows,ubuntu,assets:[...assets,'SHA256SUMS'],runtime:{version:runtimeVersion,sha256:runtimeSha}},null,2)+'\n');
console.log(`Release assets ready in ${output}`);
