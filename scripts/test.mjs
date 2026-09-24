import {build} from 'esbuild';
import {spawnSync} from 'node:child_process';
import {mkdirSync} from 'node:fs';
mkdirSync('work',{recursive:true});
await build({entryPoints:['tests/core.test.ts'],outfile:'work/core.test.mjs',bundle:true,platform:'node',format:'esm'});
const result=spawnSync(process.execPath,['--test','work/core.test.mjs'],{stdio:'inherit'});process.exit(result.status??1);
