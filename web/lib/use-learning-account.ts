import {useCallback,useEffect,useRef,useState} from 'react';
import {emptyData,mergeBackup,validateBackup,type LearningData} from './learning';
import {readLearning,writeLearning} from './storage';
import {accountRequest,ApiError,type Account} from './account';

export function useLearningAccount(known:Set<string>){
 const [data,setData]=useState<LearningData>(emptyData);
 const dataRef=useRef(data);
 const [loaded,setLoaded]=useState(false);
 const ready=useRef(false);
 const [user,setUser]=useState<Account|null>(null);
 const userRef=useRef<Account|null>(null);
 const [saveMessage,setSaveMessage]=useState('正在读取学习记录');
 const [syncMessage,setSyncMessage]=useState('');
 const scope=useRef('main'),epoch=useRef(0),saving=useRef(Promise.resolve());
 const writable=useRef(true),syncing=useRef(false),alive=useRef(true);
 const syncAction=useRef<()=>Promise<void>>(async()=>{});
 const commit=useCallback((fn:(previous:LearningData)=>LearningData)=>{
  if(!ready.current)return;
  const next=fn(dataRef.current);dataRef.current=next;setData(next);
 },[]);

 const persist=useCallback((next:LearningData,key:string)=>{
  const generation=epoch.current;
  saving.current=saving.current.catch(()=>{}).then(()=>writeLearning(next,key)).then(()=>{
   if(alive.current&&epoch.current===generation)setSaveMessage('学习记录已保存在本机');
  }).catch(()=>{
   if(alive.current&&epoch.current===generation)setSaveMessage('本机保存失败，请导出备份以免丢失。');
  });
  return saving.current;
 },[]);

 const restore=useCallback(async(account:Account|null,guest?:LearningData)=>{
  const generation=++epoch.current;
  ready.current=false;setLoaded(false);
  const key=account?`account:${account.id}`:'main';
  await saving.current;
  let next=emptyData();writable.current=true;
  try{const raw=await readLearning(key);if(raw)next=validateBackup(raw,known).data;}
  catch{writable.current=false;setSaveMessage('本机记录无法读取，可导出本次进度；原记录不会被覆盖。');}
  if(!alive.current||generation!==epoch.current)return;
  if(guest)next=mergeBackup(next,guest);
  scope.current=key;userRef.current=account;setUser(account);
  dataRef.current=next;setData(next);ready.current=true;setLoaded(true);
  setSyncMessage(account?'等待同步':'游客模式 · 仅本机保存');
 },[known]);

 useEffect(()=>{
  alive.current=true;let cancelled=false;
  // Load guest data immediately. A slow/unavailable account service never blocks studying.
  void restore(null).then(async()=>{
   const generation=epoch.current;
   try{const result=await accountRequest<{user:Account}>('me');if(!cancelled&&generation===epoch.current&&result.user)await restore(result.user);}
   catch{/* Optional login: static-only deployments and expired sessions stay in guest mode. */}
  });
  return()=>{cancelled=true;alive.current=false;ready.current=false;epoch.current++;};
 },[restore]);

 useEffect(()=>{if(loaded&&writable.current)void persist(data,scope.current);},[data,loaded,persist]);

 const sync=useCallback(async()=>{
  const account=userRef.current,generation=epoch.current;
  if(!account||!ready.current||syncing.current)return;
  syncing.current=true;setSyncMessage('正在同步…');
  try{
   const response=await accountRequest<{data:LearningData}>('sync',dataRef.current,account.id);
   if(!alive.current||generation!==epoch.current)return;
   const incoming=validateBackup(response.data,known).data;
   // A response may arrive after the user made another local edit.
   const next=mergeBackup(dataRef.current,incoming);
   if(JSON.stringify(next)!==JSON.stringify(dataRef.current))commit(()=>next);
   setSyncMessage(`已同步 · ${new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'})}`);
  }catch(error){
   if(alive.current&&generation===epoch.current)setSyncMessage(error instanceof ApiError&&[401,409].includes(error.status)?error.message:'同步失败，本机已保留，联网后将重试');
  }finally{syncing.current=false;}
 },[known,commit]);
 syncAction.current=sync;
 useEffect(()=>{
  if(!user||!loaded)return;
  const timer=setTimeout(()=>void syncAction.current(),1000);
  return()=>clearTimeout(timer);
 },[data,user,loaded]);
 useEffect(()=>{
  const online=()=>void syncAction.current();
  const visible=()=>{if(!document.hidden)online();};
  const timer=setInterval(()=>{if(!document.hidden)online();},30000);
  window.addEventListener('online',online);document.addEventListener('visibilitychange',visible);
  return()=>{clearInterval(timer);window.removeEventListener('online',online);document.removeEventListener('visibilitychange',visible);};
 },[]);

 async function signIn(mode:'login'|'register',username:string,password:string,mergeGuest:boolean){
  epoch.current++;
  const response=await accountRequest<{user:Account}>(mode,{username,password});
  // Explicitly opt in to importing this browser's guest progress.
  const guest=mergeGuest&&!userRef.current?dataRef.current:undefined;
  if(writable.current)await persist(dataRef.current,scope.current);
  await restore(response.user,guest);
 }
 async function signOut(){
  await sync();
  await accountRequest('logout',{});
  if(writable.current)await persist(dataRef.current,scope.current);
  await restore(null);
 }
 return {data,dataRef,loaded,saveMessage,syncMessage,user,commit,signIn,signOut,sync};
}
