import manifest from './audio-manifest.json';

export type SpeechState={id:string|null;status:'idle'|'loading'|'playing'|'error';error:string};
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
  this.stop();const generation=this.generation;
  if(!this.available()){this.emit({id:null,status:'error',error:'当前浏览器不支持音频播放，请使用其他浏览器。'});return;}
  const file=files[text];
  if(!file){this.emit({id:null,status:'error',error:'这段内容的音频尚未生成，请更新音频资源。'});return;}
  const audio=new Audio(new URL(`audio/${file}`,window.location.href).href);
  this.audio=audio;audio.preload='none';audio.playbackRate=rate;audio.preservesPitch=true;
  this.emit({id,status:'loading',error:''});
  const clear=()=>{if(this.timer)clearTimeout(this.timer);this.timer=null;};
  const fail=(message:string)=>{
   if(generation!==this.generation)return;
   this.stop();this.emit({id:null,status:'error',error:message});
  };
  audio.onplaying=()=>{if(generation!==this.generation)return;clear();this.emit({id,status:'playing',error:''});};
  audio.onended=()=>{if(generation!==this.generation)return;clear();this.stop();};
  audio.onerror=()=>fail(audio.error?.code===3||audio.error?.code===4?'浏览器无法解码这个音频文件，请换用其他浏览器重试。':'音频加载失败，请检查网络后重试。');
  this.timer=setTimeout(()=>fail('音频加载超时，请检查网络后重试。'),30000);
  // Start within the tap/click gesture for mobile autoplay rules.
  try{
   audio.play().catch(error=>fail(error?.name==='NotAllowedError'?'浏览器阻止了播放，请再次点击小喇叭。':'音频播放失败，请检查网络后重试。'));
  }catch{fail('无法启动音频播放，请再次点击小喇叭。');}
 }
}
