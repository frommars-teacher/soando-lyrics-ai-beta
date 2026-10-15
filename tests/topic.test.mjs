import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {JSDOM} from 'jsdom';
import {validateAnalysis} from '../src/core.js';
const lyrics='배고프다 라면먹고싶다\n\n라면인가 쫄면인가 위우위우위~~\n\n짜장면인가~ 짬뽕인가~ 위우위~\n\n소안도 사람들의 항일 정신을 기립니다 위우위';
const assessment={status:'ready',reason:'마지막 줄을 다듬어 봐요.',nextSteps:[],lineChecks:[{line:1,relation:'unrelated'},{line:3,relation:'unrelated'},{line:5,relation:'unrelated'},{line:7,relation:'connected'}]};
test('스크린샷 회귀: 주제 한 줄로 무관한 세 줄을 통과시킬 수 없음',()=>{
 const result=validateAnalysis({assessment,summary:'잘 썼어요.',feedback:[{line:7,original:lyrics.split('\n')[6],reason:'감사를 넣어 볼까요?',replacement:'소안도 사람들의 용기에 고마워요'}]},lyrics);
 assert.equal(result.assessment.status,'revise');assert.deepEqual(result.feedback,[]);
 assert.deepEqual(result.assessment.evidence.map(e=>e.line),[1,3,5]);
 assert.equal(result.assessment.evidence[0].text,'배고프다 라면먹고싶다');
 assert.ok(result.assessment.nextSteps.length);assert.doesNotMatch(result.summary,/잘 썼어요/);
});
test('모든 줄의 주제 판단이 없거나 중복·잘못된 판단이면 완성 처리 안 함',()=>{
 for(const a of [undefined,{...assessment,lineChecks:assessment.lineChecks.slice(1)},{...assessment,lineChecks:[...assessment.lineChecks.slice(1),assessment.lineChecks[1]]},{...assessment,lineChecks:assessment.lineChecks.map(c=>({...c,relation:'unknown'}))}]){
  assert.throws(()=>validateAnalysis({assessment:a,summary:'확인',feedback:[]},lyrics),e=>e.code==='AI_FORMAT');
 }
 const onlySound='위우위우\n소안도 위우위';
 const result=validateAnalysis({assessment:{...assessment,lineChecks:[{line:1,relation:'refrain'},{line:2,relation:'refrain'}]},summary:'확인',feedback:[]},onlySound);
 assert.equal(result.assessment.status,'revise');
});
test('주제에 연결된 음식 비유와 추임새는 단어 때문에 차단하지 않음',()=>{
 const text='밥 한 그릇 나누며 서로를 지켜\n그 용기를 기억할게\n위우위우';
 const result=validateAnalysis({assessment:{status:'ready',reason:'나눔과 기억이 이어져요.',nextSteps:[],lineChecks:[{line:1,relation:'connected'},{line:2,relation:'connected'},{line:3,relation:'refrain'}]},summary:'밥을 나누는 모습에 서로 지키는 마음이 담겼어요.',feedback:[]},text);
 assert.equal(result.assessment.status,'ready');
});
test('전체 다시 쓰기 안내는 완성·복사 대신 원문과 구체적인 질문을 보존',async()=>{
 const html=await fs.readFile(new URL('../public/index.html',import.meta.url),'utf8');
 const dom=new JSDOM(html,{url:'https://topic.example/',pretendToBeVisual:true});const w=dom.window;
 for(const key of ['window','document','localStorage','location'])globalThis[key]=w[key];
 Object.defineProperty(globalThis,'navigator',{value:w.navigator,configurable:true});w.scrollTo=()=>{};
 const result=validateAnalysis({assessment,summary:'확인',feedback:[]},lyrics);
 globalThis.fetch=async(path)=>Response.json(path==='/api/status'?{connected:true,authorized:true}:path==='/api/queue'?{ok:true}:result);
 const get=s=>w.document.querySelector(s);const tick=()=>new Promise(r=>setTimeout(r,0));
 await import('../public/app.js?topic-regression');await tick();get('#start').click();await tick();
 get('#intention').value='소안도 사람들의 용기에 감사하고 싶어요';get('#intention').dispatchEvent(new w.Event('input'));
 get('#lyrics').value=lyrics;get('#lyrics').dispatchEvent(new w.Event('input'));get('#analyze').click();await tick();await tick();
 assert.match(get('h2').textContent,/주제부터 다시/);assert.equal(get('#final-editor'),null);assert.equal(get('#copy'),null);
 assert.equal(get('.topic-evidence p').textContent,'배고프다 라면먹고싶다');
 w.location.hash='#result';await tick();await tick();assert.equal(get('#final-editor'),null);
 const saved=w.localStorage.getItem('soando-lyrics-ai-beta-v1');
 get('#rewrite-draft').click();await tick();assert.equal(get('#lyrics').value,lyrics);assert.match(get('#intention').value,/감사/);dom.window.close();
 const reloaded=new JSDOM(html,{url:'https://topic.example/#result',pretendToBeVisual:true});
 for(const key of ['window','document','localStorage','location'])globalThis[key]=reloaded.window[key];
 reloaded.window.scrollTo=()=>{};reloaded.window.localStorage.setItem('soando-lyrics-ai-beta-v1',saved);
 await import('../public/app.js?topic-reload');await tick();assert.match(reloaded.window.document.querySelector('h2').textContent,/주제부터 다시/);assert.equal(reloaded.window.document.querySelector('#copy'),null);reloaded.window.close();
});
