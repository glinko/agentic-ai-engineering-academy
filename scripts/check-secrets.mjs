import {spawnSync} from 'node:child_process';
import {readFile} from 'node:fs/promises';
export async function checkSources(){
 const inventory=spawnSync('git',['-c',`safe.directory=${process.cwd()}`,'ls-files','--cached','--others','--exclude-standard'],{encoding:'utf8'});
 if(inventory.status!==0)throw Error('Cannot enumerate intended Git files');
 const files=[...new Set(inventory.stdout.trim().split('\n').filter(Boolean))];
 for(const file of files){
  if(/(?:^|\/)(?:\.env(?:\..*)?|\.deploy|\.ssh-known-hosts|node_modules|dist)(?:\/|$)|\.(?:pem|key|tar\.gz)$/.test(file))throw Error(`Sensitive or generated file is not ignored: ${file}`);
  const contents=await readFile(file);
  if(/gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]+|-----BEGIN (?:OPENSSH |RSA |EC )?PRIVATE KEY-----/.test(contents.toString('utf8')))throw Error(`Credential-like content detected in ${file}`);
 }
 return files.length;
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/check-secrets.mjs')){
 try{console.log(`PASS: ${await checkSources()} intended source files scanned; no token or private-key patterns found.`);}catch(error){console.error(error.message);process.exitCode=1;}
}
