import {test} from 'node:test';
import assert from 'node:assert/strict';
import net from 'node:net';
import {authState,requireFreePort} from '../scripts/local-codex.mjs';

test('only ChatGPT login qualifies for the no-key launcher',()=>{
 assert.equal(authState({status:0,stderr:'Logged in using ChatGPT\n'}),'chatgpt');
 assert.equal(authState({status:0,stderr:'Logged in using an API key'}),'other');
 assert.equal(authState({status:1,stderr:'Not logged in'}),'signed-out');
 assert.equal(authState({status:0,stdout:'Unknown authentication mode'}),'other');
});

test('an occupied port fails without disrupting its owner',async()=>{
 const owner=net.createServer(socket=>socket.end());
 await new Promise(resolve=>owner.listen(0,'127.0.0.1',resolve));
 const port=owner.address().port;
 try{await assert.rejects(requireFreePort(port),/already in use/);assert.equal(owner.listening,true)}
 finally{await new Promise(resolve=>owner.close(resolve))}
 await requireFreePort(port);
});
