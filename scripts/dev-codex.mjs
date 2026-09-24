import {spawn} from 'node:child_process';
import {readFile,writeFile,chmod} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {requireCompatibleCodex,requireChatGPTLogin,requireFreePort} from './local-codex.mjs';

process.chdir(fileURLToPath(new URL('..',import.meta.url)));
try{requireCompatibleCodex();requireChatGPTLogin();await requireFreePort(5173);await requireFreePort(8788)}catch(error){console.error(error.message);process.exit(1)}
let vars='';try{vars=await readFile('.dev.vars','utf8')}catch(e){if(e.code!=='ENOENT')throw e}
const token=randomBytes(32).toString('hex');
vars=vars.split('\n').filter(line=>!/^\s*(CHAT_PROVIDER|CODEX_BRIDGE_TOKEN)\s*=/.test(line)).join('\n').trimEnd();
await writeFile('.dev.vars',vars+'\nCHAT_PROVIDER=codex\nCODEX_BRIDGE_TOKEN='+token+'\n',{mode:0o600});
await chmod('.dev.vars',0o600);
const children=[];let stopping=false;
function stop(code=0){if(stopping)return;stopping=true;for(const child of children)child.kill('SIGTERM');process.exitCode=code}
function start(script,args=[],extraEnv={}){const child=spawn(process.execPath,[script,...args],{stdio:'inherit',env:{...process.env,...extraEnv}});children.push(child);child.once('error',e=>{console.error(e.message);stop(1)});child.once('exit',code=>stop(code||0));return child}
process.on('SIGINT',()=>stop());process.on('SIGTERM',()=>stop());
start('scripts/codex-bridge.mjs',[],{CODEX_BRIDGE_TOKEN:token});
let ready=false;
for(let attempt=0;attempt<30&&!stopping;attempt++){
 try{const r=await fetch('http://127.0.0.1:8788/health',{headers:{Authorization:`Bearer ${token}`},signal:AbortSignal.timeout(1000)});if(r.ok){ready=true;break}}catch{}
 await new Promise(resolve=>setTimeout(resolve,100));
}
if(!stopping){if(ready)start('scripts/run-framework.mjs',['dev'],{MINDLIGHT_LOCAL_CODEX:'true'});else{console.error('The local Codex bridge could not start.');stop(1)}}
