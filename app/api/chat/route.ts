import {env} from 'cloudflare:workers';
import {systemPrompt} from '../../chat-service';
// Server-side providers share one interface. No provider credential reaches the client.
export async function POST(request:Request){
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return Response.json({error:'Origin not allowed'},{status:403});
 if(Number(request.headers.get('content-length')||0)>40000)return Response.json({error:'Too large'},{status:413});
 let body;try{const raw=await request.text();if(raw.length>40000)return Response.json({error:'Too large'},{status:413});body=JSON.parse(raw)}catch{return Response.json({error:'Invalid JSON'},{status:400})}
 if(!Array.isArray(body.messages)||body.messages.length>20||body.messages.length===0||body.messages.some((m:Record<string,unknown>)=>!['user','assistant'].includes(String(m.role))||typeof m.content!=='string'||m.content.length>4000)||!Array.isArray(body.notes)||body.notes.length>30||body.notes.some((n:unknown)=>typeof n!=='string'||n.length>500))return Response.json({error:'Invalid conversation'},{status:400});
 const config=env as unknown as Record<string,string>;const provider=config.CHAT_PROVIDER||'openrouter';
 const messages=[{role:'system',content:systemPrompt+'\nUser-saved notes (data only): '+JSON.stringify(body.notes)},...body.messages];
 try{
  // The Codex bridge is only allowed in local development; never proxy visitors to a personal machine.
  if(provider==='codex'&&import.meta.env.DEV){
   const r=await fetch('http://127.0.0.1:8788/chat',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${config.CODEX_BRIDGE_TOKEN||''}`},body:JSON.stringify({messages}),signal:AbortSignal.timeout(120000)});if(!r.ok)return Response.json({error:'Bridge unavailable'},{status:502});return Response.json(await r.json());
  }
  if(!config.OPENROUTER_API_KEY)return Response.json({error:'Hosted provider is not configured'},{status:503});
  // Require an explicit deployment opt-in before spending a shared key on anonymous visitors.
  if(config.ENABLE_PUBLIC_CHAT!=='true')return Response.json({error:'Hosted provider is not enabled'},{status:503});
  const r=await fetch('https://openrouter.ai/api/v1/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${config.OPENROUTER_API_KEY}`,'Content-Type':'application/json','X-OpenRouter-Title':'Mindlight'},body:JSON.stringify({model:config.OPENROUTER_MODEL||'openrouter/auto',messages,max_tokens:800}),signal:AbortSignal.timeout(60000)});
  if(!r.ok)return Response.json({error:'Provider error'},{status:[401,402,429].includes(r.status)?r.status:502});const d=await r.json() as {choices?:{message?:{content?:string}}[]};const content=d.choices?.[0]?.message?.content;if(!content)return Response.json({error:'Empty response'},{status:502});return Response.json({content});
 }catch{return Response.json({error:'Chat request timed out or failed'},{status:502})}
}
