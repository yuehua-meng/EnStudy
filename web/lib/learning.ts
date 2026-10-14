export type Rating='again'|'hard'|'good';
export type LearningRecord={starred:boolean;inReview:boolean;level:number;dueAt:number;updatedAt:number;seenAt:number};
export type ReviewEvent={id:string;wordId:string;rating:Rating;answeredAt:number;dueAt:number};
export type LearningData={version:1;records:Record<string,LearningRecord>;events:ReviewEvent[];selected:string};
export const emptyData=():LearningData=>({version:1,records:{},events:[],selected:'constructor'});
export const blankRecord=():LearningRecord=>({starred:false,inReview:false,level:0,dueAt:0,updatedAt:0,seenAt:0});
// IP-based HTTP deployments may not expose randomUUID, but getRandomValues works.
export function createReviewEventId():string{
 if(typeof crypto.randomUUID==='function')return crypto.randomUUID();
 const bytes=crypto.getRandomValues(new Uint8Array(16));
 bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
 const hex=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
 return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}
export function scheduleReview(record:LearningRecord,rating:Rating,now:number):LearningRecord{
 const level=rating==='good'?Math.min(6,record.level+1):0;
 const days=[0,1,3,7,14,30,60][level];
 return {...record,inReview:true,level,dueAt:now+(rating==='again'?10*60_000:rating==='hard'?86_400_000:days*86_400_000),updatedAt:now};
}
export function validateBackup(input:unknown,known:Set<string>):{data:LearningData;skipped:number}{
 if(!input||typeof input!=='object')throw new Error('文件不是有效的学习备份');
 const raw=input as Record<string,unknown>;
 if(raw.version!==1||!raw.records||typeof raw.records!=='object'||Array.isArray(raw.records)||!Array.isArray(raw.events))throw new Error('不支持的备份版本或格式');
 const data=emptyData();let skipped=0;
 for(const [id,value] of Object.entries(raw.records)){
  if(!value||typeof value!=='object')throw new Error('学习记录格式无效');
  const v=value as LearningRecord;
  if(typeof v.starred!=='boolean'||typeof v.inReview!=='boolean'||![v.level,v.dueAt,v.updatedAt,v.seenAt].every(n=>typeof n==='number'&&Number.isFinite(n)&&n>=0)||!Number.isInteger(v.level)||v.level>6||[v.dueAt,v.updatedAt,v.seenAt].some(n=>n>8.64e15))throw new Error('学习记录包含无效字段');
  if(!known.has(id)){skipped++;continue;}
  data.records[id]={starred:v.starred,inReview:v.inReview,level:v.level,dueAt:v.dueAt,updatedAt:v.updatedAt,seenAt:v.seenAt};
 }
 if(raw.events.length>10000)throw new Error('回答历史过大，最多支持 10000 条');
 const ids=new Set<string>();
 for(const value of raw.events){
  if(!value||typeof value!=='object')throw new Error('回答历史格式无效');
  const v=value as ReviewEvent;
  if(typeof v.id!=='string'||v.id.length>120||typeof v.wordId!=='string'||!['again','hard','good'].includes(v.rating)||![v.answeredAt,v.dueAt].every(n=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=8.64e15))throw new Error('回答历史包含无效字段');
  if(known.has(v.wordId)&&!ids.has(v.id)){data.events.push({id:v.id,wordId:v.wordId,rating:v.rating,answeredAt:v.answeredAt,dueAt:v.dueAt});ids.add(v.id);}
 }
 if(typeof raw.selected==='string'&&known.has(raw.selected))data.selected=raw.selected;
 return {data,skipped};
}
export function mergeBackup(local:LearningData,incoming:LearningData):LearningData{
 const records={...local.records};
 for(const [id,v]of Object.entries(incoming.records))if(!records[id]||v.updatedAt>records[id].updatedAt)records[id]=v;
 const events=Array.from(new Map([...local.events,...incoming.events].map(e=>[e.id,e])).values()).sort((a,b)=>a.answeredAt-b.answeredAt).slice(-10000);
 return {...local,records,events};
}
