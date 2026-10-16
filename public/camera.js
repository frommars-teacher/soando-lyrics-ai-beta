// Camera frames stay on this device until the student asks to read the photo.
export function captureCameraPhoto(){
 return new Promise(resolve=>{
  const dialog=document.createElement('dialog');dialog.className='camera-dialog';dialog.setAttribute('aria-labelledby','camera-title');
  dialog.innerHTML=`<div class="camera-heading"><h2 id="camera-title">손글씨 가사 찍기</h2><button type="button" class="quiet camera-close" aria-label="카메라 닫기">닫기 ✕</button></div><p class="note">종이의 가사만 화면에 담고, 글자가 선명할 때 찍어 주세요.</p><video autoplay muted playsinline aria-label="촬영할 가사 미리보기"></video><p class="camera-status note" role="status" aria-live="polite">카메라 사용을 허용해 주세요.</p><div class="camera-actions"><button type="button" class="secondary camera-gallery">갤러리에서 선택</button><button type="button" class="primary camera-shutter" disabled>사진 찍기</button></div><p class="note">촬영 화면은 전송하지 않아요. 찍은 사진은 다음 화면에서 확인해요.</p>`;
  const video=dialog.querySelector('video'),shutter=dialog.querySelector('.camera-shutter'),status=dialog.querySelector('.camera-status');
  let stream=null,finished=false,capturing=false;
  const stop=()=>{stream?.getTracks().forEach(track=>track.stop());stream=null;video.srcObject=null;};
  const finish=value=>{if(finished)return;finished=true;stop();window.removeEventListener('pagehide',leave);window.removeEventListener('hashchange',leave);document.removeEventListener('visibilitychange',hide);dialog.remove();resolve(value);};
  const leave=()=>finish(null),hide=()=>{if(document.visibilityState==='hidden')finish(null);};
  dialog.querySelector('.camera-close').onclick=leave;
  dialog.querySelector('.camera-gallery').onclick=()=>finish('gallery');
  dialog.addEventListener('cancel',event=>{event.preventDefault();finish(null);});
  dialog.addEventListener('close',leave);
  window.addEventListener('pagehide',leave);window.addEventListener('hashchange',leave);document.addEventListener('visibilitychange',hide);
  video.onloadeddata=video.oncanplay=()=>{if(finished||capturing)return;shutter.disabled=!(video.videoWidth&&video.videoHeight);if(!shutter.disabled)status.textContent='가사가 잘 보이면 ‘사진 찍기’를 눌러 주세요.';};
  shutter.onclick=async()=>{
   if(finished||capturing||!video.videoWidth||!video.videoHeight)return;
   capturing=true;shutter.disabled=true;
   try{
    const scale=Math.min(1,1600/Math.max(video.videoWidth,video.videoHeight));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(video.videoWidth*scale));canvas.height=Math.max(1,Math.round(video.videoHeight*scale));
    const ctx=canvas.getContext('2d');if(!ctx)throw new Error();ctx.drawImage(video,0,0,canvas.width,canvas.height);
    const blob=await new Promise(done=>canvas.toBlob(done,'image/jpeg',.92));if(finished)return;if(!blob)throw new Error();
    finish(new File([blob],'handwritten-lyrics.jpg',{type:'image/jpeg'}));
   }catch{if(!finished){capturing=false;shutter.disabled=false;status.textContent='사진을 찍지 못했어요. 다시 찍거나 갤러리에서 선택해 주세요.';}}
  };
  document.body.append(dialog);dialog.showModal();
  (async()=>{
   try{
    const opened=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1440}}});
    if(finished){opened.getTracks().forEach(track=>track.stop());return;}
    stream=opened;video.srcObject=stream;await video.play();
   }catch(error){
    if(finished)return;stop();shutter.disabled=true;
    status.textContent=['NotAllowedError','SecurityError'].includes(error.name)?'카메라 권한이 꺼져 있어요. 브라우저의 사이트 설정에서 카메라를 허용한 뒤 다시 열어 주세요. 갤러리 사진도 사용할 수 있어요.':error.name==='NotFoundError'?'사용할 수 있는 카메라가 없어요. 카메라가 있는 기기로 열거나 갤러리 사진을 선택해 주세요.':'카메라를 열지 못했어요. 다른 앱에서 카메라를 사용 중인지 확인한 뒤 다시 열거나 갤러리 사진을 선택해 주세요.';
   }
  })();
 });
}
