import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {captureCameraPhoto} from '../public/camera.js';
const tick=()=>new Promise(resolve=>setTimeout(resolve,0));
function setup(getUserMedia){
 const dom=new JSDOM('<body><textarea id="draft">내 가사</textarea></body>',{url:'https://camera.example/',pretendToBeVisual:true});const w=dom.window;
 for(const key of ['window','document','File'])globalThis[key]=w[key];Object.defineProperty(globalThis,'navigator',{value:w.navigator,configurable:true});
 Object.defineProperty(w.navigator,'mediaDevices',{value:{getUserMedia}});
 w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};
 w.HTMLMediaElement.prototype.play=async()=>{};
 w.HTMLCanvasElement.prototype.getContext=()=>({drawImage(){}});
 w.HTMLCanvasElement.prototype.toBlob=function(done){done(new w.Blob(['test jpeg'],{type:'image/jpeg'}));};
 return {dom,w,get:selector=>w.document.querySelector(selector)};
}
test('후면 카메라·음성 없음 → 준비 전 촬영 방지 → JPEG 촬영·종료, 기존 가사 보존',async()=>{
 let constraints,stops=0;const s=setup(async value=>{constraints=value;return {getTracks:()=>[{stop(){stops++;}}]};});
 const result=captureCameraPhoto();assert.equal(s.get('.camera-shutter').disabled,true);await tick();
 assert.equal(constraints.audio,false);assert.equal(constraints.video.facingMode.ideal,'environment');
 const video=s.get('video');Object.defineProperties(video,{videoWidth:{value:1920},videoHeight:{value:1440}});video.dispatchEvent(new s.w.Event('loadeddata'));
 assert.equal(s.get('.camera-shutter').disabled,false);s.get('.camera-shutter').click();const file=await result;
 assert.equal(file.type,'image/jpeg');assert.ok(file.size);assert.equal(stops,1);assert.equal(video.srcObject,null);assert.equal(s.get('dialog'),null);assert.equal(s.get('#draft').value,'내 가사');s.dom.window.close();
});
test('권한 거절 안내와 갤러리 선택, 가사 보존',async()=>{
 const s=setup(async()=>{throw Object.assign(new Error(),{name:'NotAllowedError'});});const result=captureCameraPhoto();await tick();
 assert.match(s.get('[role="status"]').textContent,/카메라.*허용/);assert.equal(s.get('.camera-shutter').disabled,true);
 s.get('.camera-gallery').click();assert.equal(await result,'gallery');assert.equal(s.get('#draft').value,'내 가사');s.dom.window.close();
});
test('카메라 권한 대기 중 닫아도 늦게 도착한 스트림 즉시 종료',async()=>{
 let grant,stops=0;const s=setup(()=>new Promise(resolve=>{grant=resolve;}));const result=captureCameraPhoto();s.get('.camera-close').click();assert.equal(await result,null);
 grant({getTracks:()=>[{stop(){stops++;}}]});await tick();assert.equal(stops,1);assert.equal(s.get('dialog'),null);s.dom.window.close();
});
test('취소·페이지 이동·백그라운드 전환 시 카메라 종료',async()=>{
 for(const action of ['cancel','pagehide','hashchange','hidden']){
  let stops=0;const s=setup(async()=>({getTracks:()=>[{stop(){stops++;}}]}));const result=captureCameraPhoto();await tick();
  if(action==='cancel')s.get('dialog').dispatchEvent(new s.w.Event('cancel',{cancelable:true}));
  else if(action==='hidden'){Object.defineProperty(s.w.document,'visibilityState',{value:'hidden'});s.w.document.dispatchEvent(new s.w.Event('visibilitychange'));}
  else s.w.dispatchEvent(new s.w.Event(action));
  assert.equal(await result,null);assert.equal(stops,1,action);s.dom.window.close();
 }
});
