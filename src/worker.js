import {OCR_MODEL,OCR_MAX_TOKENS,OCR_RESERVED_NEURONS,OCR_PROMPT,imageBytes,readTranscript} from './ocr.js';
import {MODEL,MAX_TOKENS,AppError,checkLyrics,messagesFor,parseModel,validateFeedback,reservedNeurons} from './core.js';
const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const json=(data,status=200,extra={})=>Response.json(data,{status,headers:{...headers,...extra}});
async function sign(value,secret){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(value)))).map(x=>x.toString(16).padStart(2,'0')).join('');}
function equal(a,b){if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0;}
async function authorized(request,env){if(!env.TEACHER_CODE)return false;const cookie=request.headers.get('Cookie')?.match(/(?:^|;\s*)soando_session=([^;]+)/)?.[1];if(!cookie)return false;const [expires,mac]=cookie.split('.');return Number(expires)>Date.now()&&Number(expires)<Date.now()+86400001&&equal(mac,await sign(expires,env.TEACHER_CODE));}
async function body(request,maxBytes=12000){const reader=request.body?.getReader();if(!reader)throw new AppError('INPUT','입력 내용을 확인해 주세요.');const chunks=[];let total=0;while(true){const {done,value}=await reader.read();if(done)break;total+=value.length;if(total>maxBytes){await reader.cancel();throw new AppError('LONG','입력한 내용이 너무 길어요.',413);}chunks.push(value);}const bytes=new Uint8Array(total);let pos=0;for(const c of chunks){bytes.set(c,pos);pos+=c.length;}try{return JSON.parse(new TextDecoder().decode(bytes));}catch{throw new AppError('INPUT','입력 내용을 확인해 주세요.');}}
export default {async fetch(request,env){
  const url=new URL(request.url);
  if(!url.pathname.startsWith('/api/'))return env.ASSETS.fetch(request);
  try{
    if(url.pathname==='/api/status'&&request.method==='GET'){
      const missing=[!env.AI&&'AI',!env.QUOTA&&'QUOTA',!env.TEACHER_CODE&&'TEACHER_CODE',env.FREE_PLAN_CONFIRMED!=='true'&&'FREE_PLAN_CONFIRMED'].filter(Boolean);
      return json({mode:'teacher-beta',connected:missing.length===0,missing,model:MODEL,ocrModel:OCR_MODEL,version:'photo-v1',authorized:await authorized(request,env)});
    }
    if(request.method!=='POST')throw new AppError('METHOD','이 요청은 사용할 수 없어요.',405);
    if(request.headers.get('Origin')!==url.origin)throw new AppError('ORIGIN','이 사이트 화면에서 다시 시도해 주세요.',403);
    if(!request.headers.get('Content-Type')?.startsWith('application/json'))throw new AppError('INPUT','입력 형식이 맞지 않아요.',415);
    if(!env.QUOTA)throw new AppError('NOT_READY','AI 연결 준비 중이에요. 교사에게 알려 주세요.',503);
    const ip=request.headers.get('CF-Connecting-IP')||'local';const ipHash=await sign(new Date().toISOString().slice(0,10)+ip,env.TEACHER_CODE||'unconfigured');
    const quota=env.QUOTA.get(env.QUOTA.idFromName('global'));
    if(url.pathname==='/api/session'){
      const limit=await quota.fetch('https://quota/login',{method:'POST',body:JSON.stringify({ipHash})});if(!limit.ok)throw new AppError('RATE','접속을 너무 많이 시도했어요. 잠시 후 다시 해 주세요.',429);
      const data=await body(request);if(!env.TEACHER_CODE||!equal(data.code,env.TEACHER_CODE))throw new AppError('CODE','교사 테스트 코드가 맞지 않아요.',401);
      const expires=String(Date.now()+4*60*60*1000);return json({ok:true},200,{'Set-Cookie':`soando_session=${expires}.${await sign(expires,env.TEACHER_CODE)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=14400`});
    }
    if(url.pathname==='/api/logout')return json({ok:true},200,{'Set-Cookie':'soando_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'});
    if(!['/api/analyze','/api/transcribe'].includes(url.pathname))throw new AppError('NOT_FOUND','요청한 기능을 찾지 못했어요.',404);
    if(!await authorized(request,env))throw new AppError('AUTH','교사 테스트 코드를 먼저 입력해 주세요.',401);
    if(env.FREE_PLAN_CONFIRMED!=='true'||!env.AI)throw new AppError('NOT_READY','무료 플랜과 AI 연결 확인이 아직 끝나지 않았어요.',503);
    const isPhoto=url.pathname==='/api/transcribe';
    const data=await body(request,isPhoto?2100000:12000);
    const image=isPhoto?imageBytes(data):null;const text=isPhoto?'':checkLyrics(data.lyrics);const messages=isPhoto?null:messagesFor(text);
    const reservation=await quota.fetch('https://quota/reserve',{method:'POST',body:JSON.stringify({ipHash,neurons:isPhoto?OCR_RESERVED_NEURONS:reservedNeurons(messages),dailyLimit:Math.min(Number(env.DAILY_REQUEST_LIMIT)||100,100),budget:Math.min(Number(env.DAILY_NEURON_BUDGET)||9000,9000)})});
    const admitted=await reservation.json();if(!reservation.ok)throw new AppError(admitted.code,admitted.message,reservation.status);
    let timer;let timedOut=false;try{
      const result=await Promise.race([env.AI.run(isPhoto?OCR_MODEL:MODEL,isPhoto?{prompt:OCR_PROMPT,image:Array.from(image),max_tokens:OCR_MAX_TOKENS,temperature:0}:{messages,max_tokens:MAX_TOKENS,temperature:0.3,response_format:{type:'json_schema',json_schema:schemaForAI()}}),new Promise((_,reject)=>{timer=setTimeout(()=>{timedOut=true;reject(new AppError('TIMEOUT','AI가 오래 생각하고 있어요. 잠시 후 다시 시도해 주세요.',504));},65000);})]);
      return json(isPhoto?readTranscript(result):validateFeedback(parseModel(result),text));
    }catch(error){if(error instanceof AppError)throw error;if(isPhoto&&/license|agree|terms|5016/i.test(error?.message||''))throw new AppError('OCR_LICENSE','사진 인식 모델의 사용 약관 확인이 필요해요. 교사가 Cloudflare에서 모델 약관을 확인해 주세요.',503);const s=Number(error?.status||error?.statusCode);if(s===429||/quota|limit|capacity|3040|3036/i.test(error?.message||''))throw new AppError('AI_LIMIT','AI 무료 한도나 처리량에 도달했어요. 잠시 후 또는 내일 다시 해 주세요.',429);throw new AppError('AI_ERROR','AI 연결에 문제가 있어요. 작성한 가사는 남아 있으니 다시 시도해 주세요.',502);
    }finally{clearTimeout(timer);if(!timedOut)await quota.fetch('https://quota/release',{method:'POST',body:JSON.stringify({lease:admitted.lease})}).catch(()=>{});}
  }catch(error){if(error instanceof AppError)return json({error:error.message,code:error.code},error.status);return json({error:'연결에 문제가 있어요. 잠시 후 다시 시도해 주세요.',code:'SERVER'},503);}
}};
import {schema} from './core.js';
function schemaForAI(){return schema;}
export class Quota {
  constructor(ctx){this.ctx=ctx;}
  async fetch(request){const data=await request.json();const now=Date.now();const day=new Date(now).toISOString().slice(0,10);return this.ctx.storage.transaction(async storage=>{
    let state=await storage.get('quota');if(!state||state.day!==day)state={day,count:0,neurons:0,ips:{},logins:{},leases:{}};
    for(const [id,until]of Object.entries(state.leases))if(until<now)delete state.leases[id];
    const path=new URL(request.url).pathname;
    if(path==='/release'){delete state.leases[data.lease];await storage.put('quota',state);return json({ok:true});}
    if(path==='/login'){const entry=state.logins[data.ipHash]||{start:now,count:0};if(now-entry.start>600000){entry.start=now;entry.count=0;}entry.count++;state.logins[data.ipHash]=entry;await storage.put('quota',state);return json({ok:entry.count<=10},entry.count<=10?200:429);}
    if(path!=='/reserve')return json({error:'not found'},404);
    if(state.count>=data.dailyLimit||state.neurons+data.neurons>data.budget)return json({code:'DAILY',message:'오늘 설정된 AI 사용 한도에 도달했어요. 선생님께 알려 주세요.'},429);
    if(Object.keys(state.leases).length>=3)return json({code:'BUSY',message:'다른 가사를 읽는 중이에요. 잠시 후 다시 눌러 주세요.'},429);
    const ip=state.ips[data.ipHash]||{start:now,count:0};if(now-ip.start>3600000){ip.start=now;ip.count=0;}if(ip.count>=100)return json({code:'RATE',message:'이 네트워크에서 많이 사용했어요. 한 시간 뒤 다시 해 주세요.'},429);
    ip.count++;state.ips[data.ipHash]=ip;state.count++;state.neurons+=data.neurons;const lease=crypto.randomUUID();state.leases[lease]=now+120000;await storage.put('quota',state);return json({lease});
  });}
}
