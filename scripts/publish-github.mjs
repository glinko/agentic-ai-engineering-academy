/** Publish using an ephemeral token; never write it to git config or a remote URL. */
import {spawnSync} from 'node:child_process';
import {checkSources} from './check-secrets.mjs';
const token=process.env.GITHUB_TOKEN;
if(!token){console.error('Set GITHUB_TOKEN for this process, then run: node scripts/publish-github.mjs');process.exit(1);}
const name=process.env.GITHUB_REPOSITORY_NAME||'agentic-ai-engineering-academy';
if(!/^[A-Za-z0-9._-]+$/.test(name))throw Error('Invalid repository name');
const headers={Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'Agentic-Academy-Publisher'};
async function request(path,options={}){
 const response=await fetch(`https://api.github.com${path}`,{...options,headers:{...headers,...options.headers}});
 const body=await response.json().catch(()=>({}));
 return {response,body};
}
function git(args,environment={}){
 const result=spawnSync('git',['-c',`safe.directory=${process.cwd()}`,...args],{env:{...process.env,...environment},encoding:'utf8'});
 if(result.status!==0){console.error((result.stderr||'Git failed').replaceAll(token,'[REDACTED]'));process.exit(result.status||1);}
 return result.stdout.trim();
}
try{
 const profile=await request('/user');
 if(!profile.response.ok)throw Error(`GitHub authentication failed (HTTP ${profile.response.status})`);
 const {login,id}=profile.body;
 let repository=await request(`/repos/${login}/${name}`);
 if(repository.response.status===404){
  repository=await request('/user/repos',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,private:true,description:'Bilingual Agentic AI Engineering Academy: Python lessons, CodeMirror, Pyodide execution, independent tests, and local progress.',auto_init:false})});
 }
 if(!repository.response.ok)throw Error(`Cannot create or access repository (HTTP ${repository.response.status}): ${repository.body.message||''}`);
 if(repository.body.owner?.login!==login)throw Error('Repository owner does not match the authenticated user');
 // An existing nonempty repository must already be the configured origin.
 const origin=spawnSync('git',['-c',`safe.directory=${process.cwd()}`,'remote','get-url','origin'],{encoding:'utf8'});
 const remote=`https://github.com/${login}/${name}.git`;
 if(repository.body.size>0&&(origin.status!==0||origin.stdout.trim()!==remote))throw Error('Repository is nonempty and is not the current origin; refusing to overwrite it');
 git(['init','-b','main']);
 await checkSources();
 git(['add','.']);
 const pending=git(['diff','--cached','--name-only']);
 if(pending)git(['-c',`user.name=${profile.body.name||login}`,'-c',`user.email=${id}+${login}@users.noreply.github.com`,'commit','-m','Build bilingual Agentic AI Engineering Academy MVP']);
 if(origin.status===0&&origin.stdout.trim()!==remote)throw Error('Origin points to a different repository');
 if(origin.status!==0)git(['remote','add','origin',remote]);
 const auth=Buffer.from(`x-access-token:${token}`).toString('base64');
 const environment={GIT_CONFIG_COUNT:'2',GIT_CONFIG_KEY_0:'http.extraHeader',GIT_CONFIG_VALUE_0:`AUTHORIZATION: basic ${auth}`,GIT_CONFIG_KEY_1:'credential.helper',GIT_CONFIG_VALUE_1:'',GIT_TERMINAL_PROMPT:'0'};
 git(['push','-u','origin','main'],environment);
 const branch=await request(`/repos/${login}/${name}/commits/main`);
 const local=git(['rev-parse','HEAD']);
 if(!branch.response.ok||branch.body.sha!==local)throw Error('Push completed but remote commit verification failed');
 console.log(JSON.stringify({url:repository.body.html_url,private:repository.body.private,commit:local},null,2));
}catch(error){console.error(String(error.message||error).replaceAll(token,'[REDACTED]'));process.exitCode=1;}
