// Only queue IDs are polled. Lyrics and images stay in this tab while waiting.
export async function queuedAI(path,data,onProgress=()=>{},options={}){
  const send=options.send||(async(path,body)=>{
    let response;try{response=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(90000)});}catch{throw new Error('인터넷 연결이 끊겼어요. 입력한 가사는 남아 있으니 연결 후 다시 시도해 주세요.');}
    let result;try{result=await response.json();}catch{throw new Error('서버 응답을 읽지 못했어요. 잠시 후 다시 시도해 주세요.');}
    if(!response.ok){const e=new Error(result.error||'연결에 문제가 있어요. 다시 시도해 주세요.');e.code=result.code;throw e;}return result;
  });
  const pause=options.pause||((ms)=>new Promise(resolve=>setTimeout(resolve,ms)));
  const requestId=crypto.randomUUID();const now=options.now||Date.now;const started=now();let retry=0;
  const waitNotice=r=>onProgress(`차례를 기다리고 있어요 · 대기 순서 ${r.position}번째. 이 화면에서 기다리면 자동으로 시작해요.`);
  try{
    while(true){
      if(now()-started>600000)throw new Error('대기 시간이 길어졌어요. 입력한 가사는 남아 있으니 잠시 후 다시 시도해 주세요.');
      onProgress(path==='/api/transcribe'?'사진 속 가사를 읽고 있어요…':'내 가사를 읽고 다듬을 부분을 찾고 있어요…');
      let result;
      try{result=await send(path,{...data,requestId});}catch(e){if(e.code!=='AI_LIMIT'||retry>=2)throw e;retry++;onProgress('AI가 바빠서 잠시 기다리고 있어요. 자동으로 다시 시도할게요.');await pause(5000*retry);continue;}
      if(!result.queued)return result;
      waitNotice(result);
      while(true){
        if(now()-started>600000)throw new Error('대기 시간이 길어졌어요. 입력한 가사는 남아 있으니 잠시 후 다시 시도해 주세요.');
        await pause(3000);result=await send('/api/queue',{requestId});
        if(result.ready)break;waitNotice(result);
      }
    }
  }finally{await send('/api/queue',{requestId,cancel:true}).catch(()=>{});}
}
