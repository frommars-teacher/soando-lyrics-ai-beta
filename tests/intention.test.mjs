import test from 'node:test';
import assert from 'node:assert/strict';
import {checkIntention,messagesFor} from '../src/core.js';
import {isShortDraft} from '../public/writing.js';
import fs from 'node:fs/promises';
import {JSDOM} from 'jsdom';
import worker from '../src/worker.js';

test('분석 API가 학생의 마음을 모델에 전달하고 잘못된 마음은 호출 전에 거절',async()=>{
 let calls=0;let payload;
 const env={PUBLIC_AI_ENABLED:'true',TEACHER_CODE:'only-test',FREE_PLAN_CONFIRMED:'true',
  QUOTA:{idFromName:x=>x,get:()=>({fetch:async()=>Response.json({lease:'test-lease'})})},
  AI:{run:async(model,input)=>{calls++;payload=input;return {response:{assessment:{status:'ready',reason:'감사의 마음을 살펴봐요.',nextSteps:[],lineChecks:[{line:1,relation:'connected'}]},summary:'함께한 용기를 기억하고 싶군요.',feedback:[]}};}}};
 const send=intention=>worker.fetch(new Request('https://test.example/api/analyze',{method:'POST',headers:{Origin:'https://test.example','Content-Type':'application/json'},body:JSON.stringify({lyrics:'고마워요',intention})}),env);
 assert.equal((await send('')).status,400);assert.equal(calls,0);
 assert.equal((await send('함께한 용기를 기억하고 싶어요')).status,200);assert.equal(calls,1);
 assert.equal(JSON.parse(payload.messages[1].content).intention,'함께한 용기를 기억하고 싶어요');
 assert.equal(payload.store,false);assert.equal(payload.chat_template_kwargs.enable_thinking,false);assert.equal(payload.response_format.type,'json_object');
});

test('마음은 별도 자료로 전달하고 공백·과도한 길이·개인정보는 거절',()=>{
 const intention='함께 싸운 사람들의 용기에 고마움을 전하고 싶어요';
 assert.equal(checkIntention(intention),intention);
 for(const value of ['', ' '.repeat(3),'가'.repeat(241),'010-1234-5678',{}])assert.throws(()=>checkIntention(value));
 const messages=messagesFor('우리의 마음',intention);
 assert.equal(JSON.parse(messages[1].content).intention,intention);
 assert.match(messages[0].content,/형식·줄 길이·반복·운율만으로 첨삭을 끝내지 않는다/);
 assert.equal(checkIntention(undefined),'');
});
test('짧은 글은 공백을 제외한 분량과 실제 줄을 보고 안내',()=>{
 assert.equal(isShortDraft('고마워요\n\n기억할게요'),true);
 assert.equal(isShortDraft('가'.repeat(80)),true);
 assert.equal(isShortDraft(Array(4).fill('가'.repeat(15)).join('\n')),false);
});
test('마음 누락 안내→마음과 가사 전달→짧은 글 확장→다시 쓰기·복원',async()=>{
 const html=await fs.readFile(new URL('../public/index.html',import.meta.url),'utf8');
 const dom=new JSDOM(html,{url:'https://heart.example/',pretendToBeVisual:true});const w=dom.window;
 for(const key of ['window','document','localStorage','location'])globalThis[key]=w[key];
 Object.defineProperty(globalThis,'navigator',{value:w.navigator,configurable:true});w.scrollTo=()=>{};
 let submitted;let calls=0;
 globalThis.fetch=async(path,options)=>{
   if(path==='/api/status')return Response.json({connected:true,authorized:true});
   if(path==='/api/queue')return Response.json({ok:true});
   calls++;submitted=JSON.parse(options.body);
   return Response.json({assessment:{status:'ready'},summary:'어떤 행동이 고마웠는지 한 줄 더 써 볼까요?',feedback:[]});
 };
 const get=s=>w.document.querySelector(s);const tick=()=>new Promise(r=>setTimeout(r,0));
 await import('../public/app.js?intention-flow');await tick();get('#start').click();await tick();
 get('#lyrics').value='고마운 마음을 전해요';get('#lyrics').dispatchEvent(new w.Event('input'));
 assert.equal(get('#length-hint').hidden,false);get('#analyze').click();await tick();
 assert.equal(calls,0);assert.match(get('#error').textContent,/어떤 마음/);assert.equal(w.document.activeElement.id,'intention');
 get('#intention').value='소안도 사람들의 용기가 고마워요';get('#intention').dispatchEvent(new w.Event('input'));
 get('#analyze').click();await tick();await tick();assert.equal(calls,1);
 assert.equal(submitted.intention,'소안도 사람들의 용기가 고마워요');assert.equal(submitted.lyrics,'고마운 마음을 전해요');
 assert.ok(get('#expand-draft'));assert.match(get('.intention-recap').textContent,/용기가 고마워요/);
 assert.doesNotMatch(get('.heading h2').textContent,/완성됐어요|간직/);
 get('#expand-draft').click();await tick();assert.equal(get('#lyrics').value,submitted.lyrics);assert.equal(get('#intention').value,submitted.intention);
 assert.equal(JSON.parse(w.localStorage.getItem('soando-lyrics-ai-beta-v1')).intention,submitted.intention);
 dom.window.close();
});
