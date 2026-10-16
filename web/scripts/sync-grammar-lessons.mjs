import {readdirSync,readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';

// The supplied Markdown files remain the source of truth; never rewrite them.
const sources=[
 {id:'grammar',label:'英语全语法',directory:'英语全语法_md',count:48,eyebrow:'ENGLISH GRAMMAR',description:'从基础词性到时态、从句和句式，按章节逐步学习。'},
 {id:'ipa',label:'国际音标',directory:'学习资料/国际音标_md',count:18,eyebrow:'INTERNATIONAL PHONETIC ALPHABET',description:'从英文字母到元音、辅音与单词拼读，按章节学习国际音标。'},
 {id:'spoken',label:'口语语音',directory:'学习资料/口语语音_md',count:14,eyebrow:'SPOKEN ENGLISH',description:'学习同化、连读、爆破与弱读，理解口语中的发音变化。'},
];
const collections=sources.map(({directory,count,...course})=>{
 const source=new URL(`../../${directory}/`,import.meta.url);
 const files=readdirSync(source).filter(name=>name.endsWith('.md')).sort((a,b)=>a.localeCompare(b,'en'));
 assert.equal(files.length,count,`${course.label}: expected ${count} Markdown files`);
 const lessons=files.map(file=>{
 const match=/^(\d{2}) (.+)\.md$/.exec(file);
 assert.ok(match,`Unexpected lesson filename: ${file}`);
 const [,id,name]=match;
 const markdown=readFileSync(new URL(encodeURIComponent(file),source),'utf8').replace(/^\uFEFF/,'').replace(/\r\n/g,'\n');
 assert.ok(/^# .+/m.test(markdown),`${file}: missing title`);
 return {id,title:id==='00'?'章节目录':name,file,markdown};
 });
 assert.deepEqual(lessons.map(item=>item.id),Array.from({length:count},(_,i)=>String(i).padStart(2,'0')),`${course.label}: chapter numbers must be complete and unique`);
 const links=[...lessons[0].markdown.matchAll(/\]\(([^\n]+?\.md)\)/g)];
 assert.equal(links.length,count-1,`${course.label}: directory must link to every chapter`);
 for(const [,target] of links)assert.ok(files.includes(target),`Missing linked chapter: ${target}`);
 return {...course,lessons};
});
const outputs=[
 ['grammar-catalog.json',collections.map(({lessons,...course})=>({...course,chapters:lessons.map(({markdown,...item})=>item)}))],
 ['grammar-content.json',Object.fromEntries(collections.map(course=>[course.id,Object.fromEntries(course.lessons.map(item=>[item.id,item.markdown]))]))],
];
for(const [name,data] of outputs){
 const target=new URL(`../lib/${name}`,import.meta.url);
 const output=JSON.stringify(data,null,2)+'\n';
 if(process.argv.includes('--check'))assert.equal(readFileSync(target,'utf8').replace(/\r\n/g,'\n'),output,`${name} is stale; run npm run grammar:sync`);
 else writeFileSync(target,output);
}
console.log(`${process.argv.includes('--check')?'Verified':'Synced'} ${collections.length} collections, ${collections.reduce((sum,course)=>sum+course.lessons.length,0)} complete Markdown files.`);
