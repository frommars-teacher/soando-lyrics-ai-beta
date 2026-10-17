// Test assets are separate. Student APIs reuse the coach service and quota;
// no credentials are copied into this project.
const studentPaths=new Set(['/api/status','/api/analyze','/api/transcribe','/api/queue']);
export default {async fetch(request,env){
 const path=new URL(request.url).pathname;
 if(!path.startsWith('/api/'))return env.ASSETS.fetch(request);
 if(!studentPaths.has(path))return Response.json({error:'요청한 기능을 찾지 못했어요.',code:'NOT_FOUND'},{status:404});
 if(!env.COACH)return Response.json({connected:false,authorized:false,error:'테스트용 작사 코치 연결을 준비하고 있어요.',code:'NOT_READY'},{status:503});
 try{return await env.COACH.fetch(request);}catch{return Response.json({error:'작사 코치 연결을 확인하고 다시 시도해 주세요.',code:'UPSTREAM'},{status:503});}
}};
