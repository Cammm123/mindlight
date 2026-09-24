/** Personal development bridge. Runs only on loopback and never exposes Codex credentials. */
import http from 'node:http';
import {spawn} from 'node:child_process';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {codexCommand,requireChatGPTLogin} from './local-codex.mjs';
requireChatGPTLogin();
const token=process.env.CODEX_BRIDGE_TOKEN;
if(!token||token.length<24)throw new Error('Set CODEX_BRIDGE_TOKEN to a random value of at least 24 characters. Use the same value in .dev.vars.');
let running=false;
const server=http.createServer(async(req,res)=>{
 const json=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data))};
 if(req.headers.origin)return json(403,{error:'Browser access is not allowed; use the local app server.'});
 if(req.headers.authorization!==`Bearer ${token}`)return json(401,{error:'Unauthorized'});
 if(req.method==='GET'&&req.url==='/health')return json(200,{ready:true});
 if(req.method!=='POST'||req.url!=='/chat')return json(404,{error:'Not found'});
 if(running)return json(429,{error:'One conversation at a time'});
 let raw='';try{for await(const chunk of req){raw+=chunk;if(raw.length>40000)return json(413,{error:'Too large'})}}catch{return json(400,{error:'Invalid request'})}
 let messages;try{messages=JSON.parse(raw).messages;if(!Array.isArray(messages)||messages.length===0||messages.length>21||messages.some(m=>!['system','user','assistant'].includes(m.role)||typeof m.content!=='string'||m.content.length>16000))throw new Error()}catch{return json(400,{error:'Invalid messages'})}
 running=true;let directory;
 try{
  // Recheck in case another Codex session changed the shared login.
  requireChatGPTLogin();
  directory=await mkdtemp(path.join(tmpdir(),'mindlight-chat-'));
  const args=['exec','--ignore-user-config','--ignore-rules','--ephemeral','--skip-git-repo-check','--sandbox','read-only','--json','--color','never','-C',directory,'-c','approval_policy="never"','-c','features.shell_tool=false','-c','features.unified_exec=false','-c','features.apps=false','-c','features.multi_agent=false','-c','features.skill_search=false','-c','web_search="disabled"','-'];
  const command=codexCommand();
  const child=spawn(command.file,[...command.args,...args],{stdio:['pipe','pipe','pipe'],shell:false});
  let output='',response='',overflow=false,totalBytes=0;
  const timeout=setTimeout(()=>child.kill('SIGTERM'),110000);
  const abort=()=>child.kill('SIGTERM');res.on('close',abort);
  child.stdout.on('data',chunk=>{output+=chunk;totalBytes+=chunk.length;if(totalBytes>1000000){overflow=true;child.kill('SIGTERM');return}let i;while((i=output.indexOf('\n'))!==-1){const line=output.slice(0,i);output=output.slice(i+1);try{const e=JSON.parse(line);if(e.type==='item.completed'&&e.item?.type==='agent_message')response=e.item.text}catch{}}});
  child.stderr.resume();
  child.stdin.end('This is a text-only conversation in Mindlight. Do not use tools, inspect files, or perform actions. Reply to the final user message using this conversation as context.\n'+JSON.stringify(messages));
  const code=await new Promise((resolve,reject)=>{child.once('error',reject);child.once('close',resolve)}).finally(()=>{clearTimeout(timeout);res.off('close',abort)});
  if(code!==0||overflow||!response)return json(502,{error:'Codex did not return a reply. Check local Codex login and limits.'});
  json(200,{content:response});
 }catch{json(502,{error:'Could not start Codex. Install the CLI and sign in locally.'})}finally{running=false;if(directory)await rm(directory,{recursive:true,force:true})}
});
server.listen(8788,'127.0.0.1',()=>console.log('Mindlight personal Codex bridge: http://127.0.0.1:8788 (loopback only)'));
