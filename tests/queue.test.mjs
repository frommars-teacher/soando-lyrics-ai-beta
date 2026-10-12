import test from 'node:test';import assert from 'node:assert/strict';import {Quota} from '../src/worker.js';import {queuedAI} from '../public/queue.js';
function setup(){const map=new Map();const s={get:async k=>structuredClone(map.get(k)),put:async(k,v)=>map.set(k,structuredClone(v)),transaction:async fn=>fn(s)};const q=new Quota({storage:s});const call=async(path,data)=>{const r=await q.fetch(new Request('https://quota/'+path,{method:'POST',body:JSON.stringify(data)}));return {status:r.status,...await r.json()};};return {call,map};}
const data=i=>({requestId:`00000000-0000-0000-0000-${String(i).padStart(12,'0')}`,owner:'teacher-'+i,ipHash:'school',neurons:100,dailyLimit:100,budget:9000,concurrency:6});
for(const slots of [6,10,20])test(`20 requests:${slots} active, remaining FIFO waiting, polling does not bill, all complete independently`,async()=>{
 const {call,map}=setup();let active=[];const item=i=>({...data(i),concurrency:slots});
 for(let i=0;i<20;i++){const r=await call('reserve',item(i));assert.equal(r.status,i<slots?200:202);if(i<slots)active.push(r.lease);else assert.equal(r.position,i-slots+1);}
 assert.equal(map.get('quota').count,slots);assert.equal(map.get('quota').neurons,slots*100);
 assert.ok(!JSON.stringify(map.get('quota')).includes('lyrics'));
 for(let i=slots;i<20;i++)assert.equal((await call('status',item(i))).ready,false);
 assert.equal(map.get('quota').count,slots);
 // No later student can jump ahead of the available positions.
 for(const lease of active)await call('release',{lease});
 if(20-slots>slots)assert.equal((await call('reserve',item(19))).status,202);
 for(let base=slots;base<20;base+=slots){active=[];for(let i=base;i<Math.min(base+slots,20);i++){assert.equal((await call('status',item(i))).ready,true);const r=await call('reserve',item(i));assert.equal(r.status,200);active.push(r.lease);}for(const lease of active)await call('release',{lease});}
 assert.equal(map.get('quota').count,20);assert.equal(map.get('quota').neurons,2000);assert.equal(map.get('quota').queue.length,0);assert.equal(Object.keys(map.get('quota').leases).length,0);
});
test('queue ownership, cancellation, duplicate inference, expired waiting and daily cap',async()=>{
 const {call,map}=setup();for(let i=0;i<6;i++)await call('reserve',data(i));
 assert.equal((await call('reserve',data(0))).status,409);
 await call('reserve',data(6));assert.equal((await call('status',{...data(6),owner:'other'})).status,409);assert.equal((await call('reserve',{...data(6),owner:'other'})).status,403);
 await call('cancel',{...data(6),owner:'other'});assert.equal(map.get('quota').queue.length,1);await call('cancel',data(6));assert.equal(map.get('quota').queue.length,0);
 await call('reserve',data(7));map.get('quota').queue[0].until=0;assert.equal((await call('status',data(7))).status,409);
 assert.equal((await call('reserve',{...data(8),dailyLimit:6})).status,429);
});
test('client polls IDs only, resumes once, bounded AI retry and cleans up',async()=>{
 const calls=[],notices=[];let inference=0,polls=0;
 const result=await queuedAI('/api/transcribe',{image:'private-photo'},m=>notices.push(m),{pause:async()=>{},send:async(path,body)=>{calls.push({path,body});if(path==='/api/transcribe'){inference++;return inference===1?{queued:true,position:14}:{text:'내 가사'};}if(body.cancel)return {ok:true};polls++;return {queued:true,position:polls===1?8:1,ready:polls>1};}});
 assert.equal(result.text,'내 가사');assert.equal(inference,2);assert.equal(polls,2);assert.ok(notices.some(n=>n.includes('14번째')));assert.ok(calls.filter(c=>c.path==='/api/queue').every(c=>!c.body.image));assert.equal(new Set(calls.map(c=>c.body.requestId)).size,1);
 let attempts=0;await assert.rejects(queuedAI('/api/analyze',{lyrics:'내 가사'},()=>{},{pause:async()=>{},send:async(path,body)=>{if(body.cancel)return {};attempts++;throw Object.assign(new Error('busy'),{code:'AI_LIMIT'});}}),/busy/);assert.equal(attempts,3);
});
test('network loss is not silently resubmitted and waiting has a time limit',async()=>{
 let calls=0;await assert.rejects(queuedAI('/api/analyze',{lyrics:'원문'},()=>{},{send:async(path,body)=>{if(body.cancel)return {};calls++;throw new Error('network');}}),/network/);assert.equal(calls,1);
 let time=0;await assert.rejects(queuedAI('/api/analyze',{lyrics:'원문'},()=>{},{now:()=>time,pause:async()=>{time=600001;},send:async(path,body)=>body.cancel?{}:{queued:true,position:1,ready:false}}),/대기 시간이/);
});
