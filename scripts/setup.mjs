import {authState,requireCompatibleCodex,requireChatGPTLogin,runCodex} from './local-codex.mjs';

try{
 requireCompatibleCodex();
 const state=authState(runCodex(['login','status']));
 if(state==='signed-out'&&!process.argv.includes('--check')){
  if(!process.stdin.isTTY)throw new Error('Sign-in needs your terminal and browser. Run npm run codex:login yourself, complete the ChatGPT sign-in, then run npm run local.');
  console.log('Opening the official Codex sign-in. Complete it in your browser using your own ChatGPT account.');
  const login=runCodex(['login'],{stdio:'inherit',timeout:0});
  if(login.error||login.status!==0)throw new Error('Sign-in was not completed. Retry with npm run codex:login.');
 }
 requireChatGPTLogin();
 console.log('Ready: Codex is signed in with ChatGPT. No API key needed.\nRun npm run local, then open http://localhost:5173.\nReplies use your ChatGPT account’s Codex allowance; CLI access and available usage are required.');
}catch(error){console.error('\n'+error.message);process.exitCode=1}
