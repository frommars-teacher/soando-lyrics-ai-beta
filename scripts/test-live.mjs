// 실제 배포 서비스만 호출합니다. 샘플 반환/데모 모드는 없습니다.
import fs from 'node:fs/promises';
const base=process.env.BETA_URL;const code=process.env.TEACHER_CODE;
if(!base||!code){console.error('BETA_URL과 TEACHER_CODE 환경변수를 설정하세요.');process.exit(1);}
const origin=new URL(base).origin;const headers={'Content-Type':'application/json',Origin:origin};
const login=await fetch(origin+'/api/session',{method:'POST',headers,body:JSON.stringify({code})});
if(!login.ok)throw new Error('교사 세션 연결 실패: '+login.status);
headers.Cookie=login.headers.get('set-cookie').split(';')[0];
const cases=JSON.parse(await fs.readFile(new URL('../tests/quality-cases.json',import.meta.url),'utf8'));
const report=[];
for(const item of cases){const start=Date.now();const r=await fetch(origin+'/api/analyze',{method:'POST',headers,body:JSON.stringify({lyrics:item.name==='입력 한도 초과'?'가'.repeat(1201):item.lyrics})});const body=await r.json();report.push({name:item.name,status:r.status,milliseconds:Date.now()-start,...body});console.log(item.name,r.status,Date.now()-start+'ms');}
await fs.mkdir('test-results',{recursive:true});await fs.writeFile('test-results/live-quality.json',JSON.stringify(report,null,2));
if(report.some(x=>x.status!==200&&x.name!=='입력 한도 초과'))process.exitCode=1;
