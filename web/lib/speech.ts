import manifest from './audio-manifest.json';

export type SpeechState={id:string|null;status:'idle'|'loading'|'playing'|'error';error:string;sequence?:{key:string;completed:number;total:number;paragraph:number;paragraphs:number}};
export type SpeechItem={id:string;text:string};
export type VoiceChoice={id:string;name:string;lang:string;local:boolean};
const files:Record<string,string>=manifest.textToFile;

// Browser audio playback only: all speech is generated ahead of time by Piper.
export class SpeechController{
 private generation=0;
 private audio:HTMLAudioElement|null=null;
 private timer:ReturnType<typeof setTimeout>|null=null;
 constructor(private emit:(state:SpeechState)=>void){}
 available(){return typeof window!=='undefined'&&typeof Audio!=='undefined';}
 voices():VoiceChoice[]{return [{id:manifest.voice,name:manifest.label,lang:'en-US',local:false}];}
 stop(){
  this.generation++;
  if(this.timer)clearTimeout(this.timer);
  this.timer=null;
  if(this.audio){
   this.audio.onplaying=null;this.audio.onended=null;this.audio.onerror=null;
   this.audio.pause();this.audio.removeAttribute('src');this.audio.load();
  }
  this.audio=null;
  this.emit({id:null,status:'idle',error:''});
 }
 play(id:string,text:string,rate:number){
  this.playSequence([{id,text}],1,rate);
 }
 playSequence(items:SpeechItem[],repeats:number,rate:number,key?:string){
  this.stop();const generation=this.generation;
  if(!this.available()){this.emit({id:null,status:'error',error:'当前浏览器不支持音频播放，请使用其他浏览器。'});return;}
  if(!Number.isInteger(repeats)||repeats<1||repeats>10000||!items.length){this.emit({id:null,status:'error',error:'请输入 1–10000 之间的整数遍数。'});return;}
  if(items.some(item=>!files[item.text])){this.emit({id:null,status:'error',error:'这段内容的音频尚未生成，请更新音频资源。'});return;}
  // Reuse the element unlocked by the original tap for every paragraph and repeat.
  const audio=new Audio();
  this.audio=audio;audio.preload='none';audio.playbackRate=rate;audio.preservesPitch=true;
  let index=0,completed=0;
  const sequence=()=>key?{key,completed,total:repeats,paragraph:index+1,paragraphs:items.length}:undefined;
  const clear=()=>{if(this.timer)clearTimeout(this.timer);this.timer=null;};
  const fail=(message:string)=>{
   if(generation!==this.generation)return;
   this.stop();this.emit({id:null,status:'error',error:message,sequence:sequence()});
  };
  audio.onplaying=()=>{if(generation!==this.generation)return;clear();this.emit({id:items[index].id,status:'playing',error:'',sequence:sequence()});};
  audio.onended=()=>{
   if(generation!==this.generation)return;
   clear();index++;
   if(index===items.length){index=0;completed++;}
   if(completed===repeats){this.stop();this.emit({id:null,status:'idle',error:'',sequence:sequence()});return;}
   start();
  };
  audio.onerror=()=>fail(audio.error?.code===3||audio.error?.code===4?'浏览器无法解码这个音频文件，请换用其他浏览器重试。':'音频加载失败，请检查网络后重试。');
  const start=()=>{
   audio.src=new URL(`audio/${files[items[index].text]}`,window.location.href).href;
   audio.playbackRate=rate;
   this.emit({id:items[index].id,status:'loading',error:'',sequence:sequence()});
   this.timer=setTimeout(()=>fail('音频加载超时，请检查网络后重试。'),30000);
   try{audio.play().catch(error=>fail(error?.name==='NotAllowedError'?'浏览器阻止了播放，请保持页面在前台并再次点击播放。':'音频播放失败，请检查网络后重试。'));}
   catch{fail('无法启动音频播放，请再次点击小喇叭。');}
  };
  start();
 }
}
