import {readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {checkSources} from './check-secrets.mjs';

const token=process.env.GITHUB_TOKEN;
if(!token)throw Error('Set GITHUB_TOKEN for this process');
const repository='glinko/agentic-ai-engineering-academy';
const manifest=JSON.parse(await readFile('.release/build.json','utf8'));
const tag=`v${manifest.version}`;
if(!/^v\d+\.\d+\.\d+$/.test(tag))throw Error('Invalid release version');
function git(...args){const result=spawnSync('git',['-c',`safe.directory=${process.cwd()}`,...args],{encoding:'utf8'});if(result.status!==0)throw Error(result.stderr);return result.stdout.trim();}
const commit=git('rev-parse','HEAD');
if(git('status','--porcelain'))throw Error('Commit all source changes before publishing');
await checkSources();
const headers={Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'Agentic-Academy-Releases'};
async function api(path,method='GET',body){
 const response=await fetch(`https://api.github.com/repos/${repository}${path}`,{method,headers:{...headers,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
 const data=await response.json().catch(()=>({}));
 return {response,data};
}
function assertOk(result,operation){if(!result.response.ok)throw Error(`${operation}: HTTP ${result.response.status}: ${result.data.message||''}`);return result.data;}
try{
 const remote=assertOk(await api('/commits/main'),'Read main');
 if(remote.sha!==commit)throw Error('Push the exact source commit to main before releasing');
 let info=assertOk(await api(''),'Read repository');
 if(info.private){
  if(process.env.CONFIRM_PUBLIC_RELEASE!=='yes')throw Error('Making the repository public requires CONFIRM_PUBLIC_RELEASE=yes');
  info=assertOk(await api('','PATCH',{private:false}),'Make repository public');
 }
 if(info.private)throw Error('Repository remains private');
 const reference=await api(`/git/ref/tags/${tag}`);
 if(reference.response.status===404)assertOk(await api('/git/refs','POST',{ref:`refs/tags/${tag}`,sha:commit}),'Create release tag');
 else if(assertOk(reference,'Read tag').object.sha!==commit)throw Error('Release tag already points to a different commit');
 let releaseResult=await api(`/releases/tags/${tag}`);
 let release;
 if(releaseResult.response.status===404){
  release=assertOk(await api('/releases','POST',{tag_name:tag,target_commitish:commit,name:`Agentic Academy ${tag} — Windows & Ubuntu`,body:await readFile(`docs/releases/${tag}.md`,'utf8'),draft:true,prerelease:false}),'Create draft release');
 }else{
  release=assertOk(releaseResult,'Read release');
  if(!release.draft)throw Error('Release is already published; refusing to overwrite immutable assets');
 }
 for(const name of manifest.assets){
  if(!/^[A-Za-z0-9._-]+$/.test(name))throw Error('Invalid release asset name');
  const file=await readFile(`.release/${name}`);
  const digest=`sha256:${createHash('sha256').update(file).digest('hex')}`;
  const existing=release.assets.find(asset=>asset.name===name);
  if(existing){if(existing.digest!==digest||existing.size!==file.length)throw Error(`Draft asset mismatch: ${name}`);continue;}
  const uploadUrl=release.upload_url.replace(/\{.*$/,'')+`?name=${encodeURIComponent(name)}`;
  if(new URL(uploadUrl).hostname!=='uploads.github.com')throw Error('Unexpected upload host');
  const response=await fetch(uploadUrl,{method:'POST',headers:{...headers,'Content-Type':'application/octet-stream','Content-Length':String(file.length)},body:file});
  const uploaded=await response.json();
  if(!response.ok)throw Error(`Upload failed: ${name}: HTTP ${response.status}`);
  if(uploaded.size!==file.length||uploaded.digest&&uploaded.digest!==digest)throw Error(`Uploaded asset verification failed: ${name}`);
  console.log(`Uploaded ${name}`);
 }
 release=assertOk(await api(`/releases/${release.id}`),'Verify draft');
 for(const name of manifest.assets)if(!release.assets.some(asset=>asset.name===name&&asset.state==='uploaded'))throw Error(`Missing uploaded asset: ${name}`);
 release=assertOk(await api(`/releases/${release.id}`,'PATCH',{draft:false,make_latest:'true'}),'Publish release');
 console.log(JSON.stringify({url:release.html_url,tag,commit,public:!info.private,assets:release.assets.map(a=>({name:a.name,url:a.browser_download_url,size:a.size,digest:a.digest}))},null,2));
}catch(error){console.error(String(error.message||error).replaceAll(token,'[REDACTED]'));process.exitCode=1;}
