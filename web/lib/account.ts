export type Account={id:string;username:string};
export class ApiError extends Error{constructor(message:string,public status:number){super(message);}}
export function secureAccountAccess(){return window.location.protocol==='https:'||['localhost','127.0.0.1','[::1]'].includes(window.location.hostname);}
export async function accountRequest<T>(path:string,body?:unknown,accountId?:string):Promise<T>{
 if(!secureAccountAccess())throw new ApiError('登录与云同步需要 HTTPS 安全连接，当前仍可使用游客模式。',0);
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),15000);
 try{
  const response=await fetch(new URL(`api/${path}`,window.location.href),{
   method:body===undefined?'GET':'POST',credentials:'same-origin',cache:'no-store',signal:controller.signal,
   headers:{...(body===undefined?{}:{'Content-Type':'application/json'}),...(accountId?{'X-EnStudy-Account':accountId}:{})},
   body:body===undefined?undefined:JSON.stringify(body),
  });
  const value=await response.json().catch(()=>null) as {error?:unknown}|null;
  if(!response.ok)throw new ApiError(typeof value?.error==='string'?value.error:'账户服务暂时不可用，请稍后重试',response.status);
  if(!value||typeof value!=='object')throw new ApiError('账户服务尚未配置，请联系站点维护者',503);
  return value as T;
 }catch(error){if(error instanceof ApiError)throw error;throw new ApiError('无法连接账户服务，本机学习记录仍然保留。',0);}
 finally{clearTimeout(timeout);}
}
