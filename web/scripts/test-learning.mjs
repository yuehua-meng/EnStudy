import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import ts from 'typescript';

function load(path){
 const url=new URL(path,import.meta.url),module={exports:{}};
 const code=ts.transpileModule(readFileSync(url,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
 new Function('require','module','exports',code)(createRequire(url),module,module.exports);
 return module.exports;
}
const {SpeechController}=load('../lib/speech.ts');
const {mergeBackup,emptyData,learningRecord,validateBackup}=load('../lib/learning.ts');
const {normalizePhone,accountLabel,phoneCountries}=load('../lib/phone.ts');
const manifest=JSON.parse(readFileSync(new URL('../lib/audio-manifest.json',import.meta.url),'utf8'));
const texts=Object.keys(manifest.textToFile).slice(0,4);
let created=[];
class FakeAudio{
 constructor(){this.plays=0;created.push(this);}
 play(){this.plays++;this.onplaying?.();return Promise.resolve();}
 pause(){this.paused=true;}
 removeAttribute(){}
 load(){}
}
globalThis.Audio=FakeAudio;
globalThis.window={location:{href:'https://study.example.com/enstudy/'}};
const items=texts.map((text,i)=>({id:`paragraph-${i}`,text}));

test('exactly 1000 whole-article repetitions, four paragraphs, one audio element',()=>{
 created=[];let state;const controller=new SpeechController(value=>state=value);
 controller.playSequence(items,1000,.8,'01');
 const audio=created[0];
 assert.equal(state.sequence.paragraph,1);
 for(let n=0;n<3999;n++)audio.onended();
 assert.equal(state.sequence.completed,999);assert.equal(state.sequence.paragraph,4);
 audio.onended();
 assert.equal(audio.plays,4000);assert.equal(created.length,1);
 assert.equal(state.sequence.completed,1000);assert.equal(state.status,'idle');assert.equal(audio.onended,null);
 assert.equal(audio.playbackRate,.8);
});
test('stop and replacement reject stale callbacks without restarting sequence',()=>{
 created=[];let state;const controller=new SpeechController(value=>state=value);
 controller.playSequence(items,100,1,'01');
 const old=created[0],stale=old.onended;
 controller.play('single',texts[0],1);stale();
 assert.equal(state.id,'single');assert.equal(created.length,2);assert.equal(old.plays,1);
 controller.stop();assert.equal(state.status,'idle');assert.equal(created[1].onended,null);
});
test('invalid counts and missing audio fail before playback',()=>{
 created=[];let state;const controller=new SpeechController(value=>state=value);
 for(const n of [0,-1,1.5,NaN,Infinity,10001]){controller.playSequence(items,n,1,'01');assert.equal(state.status,'error');}
 controller.playSequence([{id:'missing',text:'not in the manifest'}],1,1,'01');
 assert.equal(state.status,'error');assert.equal(created.length,0);
});
test('load failure terminates the loop and reports completed full articles only',()=>{
 created=[];let state;const controller=new SpeechController(value=>state=value);
 controller.playSequence(items,3,1,'01');const audio=created[0];
 for(let n=0;n<5;n++)audio.onended();audio.onerror();
 assert.equal(state.status,'error');assert.equal(state.sequence.completed,1);assert.equal(audio.onended,null);
});
test('offline merge keeps newer removals, newer seen time and unique review events',()=>{
 const a=emptyData(),b=emptyData();
 a.records.word={starred:false,inReview:false,updatedAt:200,seenAt:1,level:0,dueAt:0};
 b.records.word={starred:true,inReview:true,updatedAt:100,seenAt:150,level:0,dueAt:0};
 const event={id:'one',wordId:'word',rating:'good',answeredAt:1,dueAt:2};
 a.events=[event];b.events=[event];
 const merged=mergeBackup(a,b);
 assert.equal(merged.records.word.starred,false);assert.equal(merged.records.word.inReview,false);
 assert.equal(merged.records.word.seenAt,150);assert.equal(merged.events.length,1);
});
test('constructor is a real vocabulary key, not Object.constructor; migrate old incomplete records',()=>{
 const blank=emptyData();assert.equal(learningRecord(blank,'constructor').starred,false);
 const incoming=emptyData();incoming.records.constructor={...learningRecord(blank,'constructor'),starred:true,updatedAt:1};
 const merged=mergeBackup(blank,incoming);assert.equal(merged.records.constructor.starred,true);
 const legacy=emptyData();legacy.records.constructor={starred:true,updatedAt:1};
 const restored=validateBackup(legacy,new Set(['constructor'])).data;
 assert.equal(restored.records.constructor.inReview,false);assert.equal(restored.records.constructor.level,0);
});
test('simultaneous conflicting edits converge regardless of merge direction',()=>{
 const a=emptyData(),b=emptyData();
 a.records.word={starred:false,inReview:true,updatedAt:200,seenAt:1,level:1,dueAt:1000};
 b.records.word={...a.records.word,starred:true,seenAt:2};
 assert.deepEqual(mergeBackup(a,b).records,mergeBackup(b,a).records);
});
test('international phone normalization agrees with backend fixtures',()=>{
 const cases=JSON.parse(readFileSync(new URL('../../tests/phone-cases.json',import.meta.url),'utf8'));
 for(const row of cases)assert.equal(normalizePhone(row.input,row.country),row.expected,JSON.stringify(row));
 assert.equal(accountLabel('13800138000'),'+86 138****8000');assert.equal(accountLabel('legacy_user'),'legacy_user');
 const countries=phoneCountries();assert.ok(countries.length>200);assert.equal(countries[0].country,'CN');
 assert.equal(new Set(countries.map(item=>item.country)).size,countries.length);
});
