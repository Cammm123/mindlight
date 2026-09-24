import {spawnSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import net from 'node:net';

export function codexCommand(){
 if(process.env.CODEX_BIN)return {file:process.env.CODEX_BIN,args:[]};
 const cli=fileURLToPath(new URL('../node_modules/@openai/codex/bin/codex.js',import.meta.url));
 if(!existsSync(cli))throw new Error('Dependencies are missing. Run npm ci, then npm run setup.');
 return {file:process.execPath,args:[cli]};
}
export function runCodex(args,options={}){
 const command=codexCommand();
 return spawnSync(command.file,[...command.args,...args],{encoding:'utf8',timeout:15000,...options});
}
export function requireCompatibleCodex(){
 const [major,minor]=process.versions.node.split('.').map(Number);
 if(major<22||(major===22&&minor<13))throw new Error('Mindlight requires Node.js 22.13 or newer. Install Node.js, then run npm ci.');
 const help=runCodex(['exec','--help']);
 if(help.error||help.status!==0)throw new Error('Codex could not start. Run npm ci with optional dependencies enabled. Windows users can also use WSL2.');
 for(const flag of ['--ignore-user-config','--ignore-rules','--ephemeral','--sandbox']){
  if(!help.stdout.includes(flag))throw new Error('This Codex CLI is incompatible. Remove CODEX_BIN to use the version included with Mindlight, then run npm ci.');
 }
}
export function authState(result){
 if(result.error||result.status!==0)return 'signed-out';
 return /logged in using chatgpt/i.test((result.stdout||'')+(result.stderr||''))?'chatgpt':'other';
}
export function requireChatGPTLogin(){
 const state=authState(runCodex(['login','status']));
 if(state==='signed-out')throw new Error('Sign in with your own ChatGPT account: run npm run setup.');
 if(state!=='chatgpt')throw new Error('Codex is using a different authentication method. For the no-API-key setup, run npm run codex:login and choose your ChatGPT account. Your existing login has not been changed.');
}
export async function requireFreePort(port,host='127.0.0.1'){
 await new Promise((resolve,reject)=>{
  const server=net.createServer();
  server.once('error',()=>reject(new Error(`Port ${port} is already in use or unavailable. Stop the existing local server, then retry. Its configuration has not been changed.`)));
  server.listen({port,host,exclusive:true},()=>server.close(resolve));
 });
}
