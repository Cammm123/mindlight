import {runCodex} from './local-codex.mjs';
try{
 const result=runCodex(['login',...(process.argv.includes('--device-auth')?['--device-auth']:[])],{stdio:'inherit',timeout:0});
 if(result.error)throw result.error;
 process.exitCode=result.status??1;
}catch{console.error('Could not start Codex sign-in. Run npm ci first.');process.exitCode=1}
