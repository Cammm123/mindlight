'use client';
import {useState,useEffect,useRef} from 'react';
import {ArrowUp,Plus,X,Square,Focus} from 'lucide-react';
import {reply,demoReply,memoryAction,type Message,type ChatConfig} from './chat-service';
import Brain from './Brain';
import {regions,findRegion,analyze,type RegionId} from './brain-data';

export default function Home(){
 const [selected,setSelected]=useState<RegionId|null>(null);
 const [cameraReset,setCameraReset]=useState(0);
 const [activity,setActivity]=useState(analyze('hello'));
 const [messages,setMessages]=useState<Message[]>([]);
 const [input,setInput]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const [notes,setNotes]=useState<string[]>([]),[storageReady,setStorageReady]=useState(false);
 const [config,setConfig]=useState<ChatConfig>({provider:'demo',apiKey:'',model:'openrouter/auto'});
 const [connecting,setConnecting]=useState(false),[keyDraft,setKeyDraft]=useState('');
 const scroll=useRef<HTMLDivElement>(null),request=useRef<AbortController|null>(null),busyRef=useRef(false),composer=useRef<HTMLTextAreaElement>(null);
 useEffect(()=>{try{const saved=JSON.parse(localStorage.getItem('mindlight-notes')||'[]');if(Array.isArray(saved))setNotes(saved.filter(n=>typeof n==='string').slice(-30))}catch{}setStorageReady(true);return()=>request.current?.abort()},[]);
 useEffect(()=>{if(!import.meta.env.DEV)return;const controller=new AbortController();void fetch('/api/chat',{signal:controller.signal}).then(r=>r.json() as Promise<{provider?:string}>).then(data=>{if(data.provider==='codex'&&!controller.signal.aborted)setConfig(c=>c.provider==='demo'?{...c,provider:'hosted'}:c)}).catch(()=>{});return()=>controller.abort()},[]);
 useEffect(()=>{if(storageReady)try{localStorage.setItem('mindlight-notes',JSON.stringify(notes))}catch{setError('Notes work in this conversation, but this browser cannot save them across visits.')}},[notes,storageReady]);
 useEffect(()=>{if(scroll.current)scroll.current.scrollTop=scroll.current.scrollHeight},[messages,busy,connecting]);
 useEffect(()=>{
  const context=(document as unknown as {modelContext?:{registerTool:(tool:unknown,options:unknown)=>Promise<void>|void}}).modelContext;if(!context?.registerTool)return;const lifecycle=new AbortController();
  try{void Promise.resolve(context.registerTool({name:'explore_brain_region',description:'Select an anatomical brain region and show its educational explanation.',inputSchema:{type:'object',properties:{region:{type:'string',enum:regions.map(r=>r.id)}},required:['region'],additionalProperties:false},annotations:{readOnlyHint:false},execute:async(input:{region:string})=>{const region=regions.find(r=>r.id===input.region);if(!region)throw new Error('Unknown region');setSelected(region.id);await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));return {region:region.name,explanation:region.description}}},{signal:lifecycle.signal})).catch(()=>{})}catch{}return()=>lifecycle.abort();
 },[]);
 const send=async(raw:string)=>{
  const text=raw.trim();if(!text||busyRef.current)return;
  if(text==='/connect'){setConnecting(true);setInput('');return;}
  if(text==='/local'&&import.meta.env.DEV){setConfig(c=>({...c,provider:'hosted'}));setInput('');return;}
  if(text.length>4000){setError('Please keep messages under 4,000 characters.');return;}
  busyRef.current=true;setBusy(true);setError('');setInput('');setSelected(null);
  const next:Message[]=[...messages,{role:'user',content:text}];setMessages(next);
  let updated=notes,answer='';const action=memoryAction(text);
  if(/(?:why|what|explain).*(?:lit|light|glow|highlight|active|brain region)/i.test(text))answer=activity.explanation;
  else{setActivity(analyze(text));
   if(action==='forget'){updated=[];setNotes([]);answer='I’ve cleared your saved notes. Start a new chat to clear the earlier conversation too.';}
   else if(action==='save'){const note=text.replace(/^\s*(?:please\s+)?remember\s+(?:that\s+)?/i,'').slice(0,500);updated=[...notes.filter(n=>n!==note),note].slice(-30);setNotes(updated);answer=`I’ll remember: “${note}”\n\nSaved on this device. Say “forget all notes” to clear it.`;}
   else if(action==='recall')answer=notes.length?notes.map(n=>'• '+n).join('\n'):'No saved notes yet. Tell me something to remember.';
  }
  const controller=new AbortController();request.current=controller;const timeout=setTimeout(()=>controller.abort(),120000);
  try{if(!answer)answer=config.provider==='demo'?demoReply(text,updated):await reply(next,updated,config,controller.signal);setMessages([...next,{role:'assistant',content:answer}]);}
  catch(e){setError(e instanceof Error&&e.name!=='AbortError'?e.message:'The reply was stopped. You can try again.');setInput(text)}finally{clearTimeout(timeout);setBusy(false);busyRef.current=false;}
 };
 const newChat=()=>{if(busyRef.current)return;setMessages([]);setInput('');setError('');setSelected(null);setActivity(analyze('hello'));setConnecting(false);setKeyDraft('');composer.current?.focus()};
 const region=selected?findRegion(selected):null;
 return <main className="mindlight">
  <header className="topbar"><span className="wordmark">mindlight<span>.</span></span><button className="icon-button" aria-label="New chat" title="New chat" disabled={busy} onClick={newChat}><Plus size={20}/></button></header>
  <div className="workspace">
   <section className="brain-panel" aria-label="Brain explorer">
    <div className="brain-interaction" tabIndex={0} aria-label="Interactive brain. Drag to rotate. Use left and right arrow keys to explore regions; Escape closes the explanation." onKeyDown={e=>{if(e.key==='Escape')setSelected(null);else if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const i=regions.findIndex(r=>r.id===selected);setSelected(regions[(i+(e.key==='ArrowRight'?1:regions.length-1)+regions.length)%regions.length].id)}}}>
     <Brain active={activity.regions} selected={selected} onSelect={setSelected} xray={true} rotate={false} reset={cameraReset}/>
    </div>
    <button className="center-brain" onClick={()=>{setCameraReset(n=>n+1);setSelected(null)}} title="Reset rotation and zoom"><Focus size={15}/>Center</button>
    {region?<div className="region-note" aria-live="polite"><button className="close-note" aria-label="Close region explanation" onClick={()=>setSelected(null)}><X size={16}/></button><strong style={{color:region.color}}>{region.name}</strong><p>{region.description}</p></div>:<p className="brain-hint">Drag to rotate · Tap to explore</p>}
    <a className="model-credit" href="https://github.com/Cammm123/mindlight#anatomy-attribution" target="_blank" rel="noreferrer">Anatomy credits</a>
   </section>
   <section className="chat-panel" aria-label="Chat">
    <div className="conversation" ref={scroll} role="log" aria-label="Conversation" aria-live="polite" aria-relevant="additions text">
     {!messages.length&&<p className="hello">What’s on your mind?</p>}
     {messages.map((m,i)=><div key={i} className={'message '+m.role}><span className="sr-only">{m.role==='user'?'You':'Mindlight'}: </span><p>{m.content}</p></div>)}
     {busy&&<p className="thinking" role="status">Thinking…</p>}
     {connecting&&<form className="connection" onSubmit={e=>{e.preventDefault();if(!keyDraft.trim())return;setConfig({provider:'openrouter',apiKey:keyDraft.trim(),model:'openrouter/auto'});setKeyDraft('');setConnecting(false);setError('');composer.current?.focus()}}><div className="connection-heading"><strong>Connect OpenRouter</strong><button type="button" className="icon-button" aria-label="Cancel connection" onClick={()=>{setConnecting(false);setKeyDraft('')}}><X size={16}/></button></div><input type="password" aria-label="OpenRouter API key" autoComplete="off" value={keyDraft} onChange={e=>setKeyDraft(e.target.value)} placeholder="Your API key"/><p>The key stays in this tab. Messages and saved notes go to OpenRouter. Your account’s charges apply.</p><button className="connect-button" disabled={!keyDraft.trim()}>Connect</button></form>}
    </div>
    <div className="composer-area">
     {error&&<p className="error" role="alert">{error}</p>}
     <form className="composer" onSubmit={e=>{e.preventDefault();void send(input)}}><textarea ref={composer} value={input} maxLength={4000} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();void send(input)}}} aria-label="Your message" placeholder="Message Mindlight…" rows={1}/>{busy?<button type="button" className="send" aria-label="Stop reply" onClick={()=>request.current?.abort()}><Square size={15}/></button>:<button className="send" aria-label="Send message" disabled={!input.trim()}><ArrowUp size={20}/></button>}</form>
     <div className="quiet-footer"><button disabled={busy} onClick={()=>{if(config.provider!=='demo'){setConfig({provider:'demo',apiKey:'',model:'openrouter/auto'})}else setConnecting(v=>!v)}}>{config.provider==='demo'?'Demo · Connect AI':config.provider==='openrouter'?'OpenRouter · Disconnect':'Codex · Disconnect'}</button><span>Illustrative brain activity</span></div>
    </div>
   </section>
  </div>
 </main>
}
