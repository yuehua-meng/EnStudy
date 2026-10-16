import {useRef} from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import {BookOpen,ChevronLeft,ChevronRight} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {courses,grammarCourse,grammarHref,linkedGrammarChapter,type GrammarSection} from '@/lib/grammar';
import content from '@/lib/grammar-content.json';

type Props={section:GrammarSection;chapterId:string;onSelect:(section:GrammarSection,id:string)=>void};
export default function GrammarPanel({section,chapterId,onSelect}:Props){
 const heading=useRef<HTMLHeadingElement>(null);
 const course=grammarCourse(section)||courses[0];
 const chapters=course.chapters;
 const index=Math.max(0,chapters.findIndex(item=>item.id===chapterId)),chapter=chapters[index];
 const contentByCourse:Record<string,Record<string,string>>=content;
 const markdown=contentByCourse[course.id][chapter.id];
 const title=markdown.match(/^# (.+)/)?.[1]||chapter.title;
 // Encode spaces in supplied relative Markdown destinations so the directory links parse correctly.
 const body=markdown.replace(/^# .+\n*/, '').replace(/\]\(([^\n]+?\.md)\)/g,(_,file:string)=>`](<${encodeURI(file)}>)`);
 function select(id:string){onSelect(course!.id,id);requestAnimationFrame(()=>{heading.current?.focus({preventScroll:true});heading.current?.scrollIntoView({behavior:'smooth',block:'start'});});}
 const previous=chapters[index-1],next=chapters[index+1];
 const controls=<nav className="grammar-page-controls" aria-label="语法章节切换"><Button variant="outline" disabled={!previous} onClick={()=>previous&&select(previous.id)}><ChevronLeft size={16}/>上一章</Button><Button variant="ghost" onClick={()=>select('00')}><BookOpen size={16}/>章节目录</Button><Button variant="outline" disabled={!next} onClick={()=>next&&select(next.id)}>下一章<ChevronRight size={16}/></Button></nav>;
 return <article className="grammar-article" aria-labelledby="grammar-title">
  <header className="grammar-article-header"><span className="eyebrow">{course.eyebrow} / {chapter.id==='00'?'CONTENTS':chapter.id}</span><h2 ref={heading} tabIndex={-1} id="grammar-title">{title}</h2><p>{chapter.id==='00'?course.description:`${course.label} · 第 ${Number(chapter.id)} / ${chapters.length-1} 章`}</p>{controls}</header>
  <div className={`grammar-markdown ${chapter.id==='00'?'grammar-directory':''}`}><Markdown skipHtml remarkPlugins={[remarkGfm,remarkBreaks]} components={{
   table:({children})=><div className="grammar-table-scroll" tabIndex={0} role="region" aria-label="语法对照表"><table>{children}</table></div>,
   a:({href='',children})=>{const linked=linkedGrammarChapter(href,course.id);return linked?<a href={grammarHref(course.id,linked.id)} onClick={event=>{if(event.button||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();select(linked.id);}}>{children}</a>:<a href={href}>{children}</a>;},
  }}>{body}</Markdown></div>
  <footer className="grammar-article-footer">{controls}</footer>
 </article>;
}
