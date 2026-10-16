import catalog from './grammar-catalog.json';
export type CourseSection='grammar'|'ipa'|'spoken';
export type GrammarSection=CourseSection;
export type LessonChapter={id:string;title:string;file:string};
export type LessonCourse={id:CourseSection;label:string;eyebrow:string;description:string;chapters:LessonChapter[]};
export const courses=catalog as LessonCourse[];
export const chapters=courses.find(course=>course.id==='grammar')!.chapters;
export const lessonCount=courses.reduce((sum,course)=>sum+course.chapters.length-1,0);
export function grammarCourse(section:string){return courses.find(course=>course.id===section);}
export function grammarRoute(search:string):{section:GrammarSection;chapterId:string}|null{
 const params=new URLSearchParams(search),section=params.get('section');
 if(section==='phonetics')return {section:'ipa',chapterId:'00'};
 const course=grammarCourse(section||'');
 if(!course)return null;
 const requested=params.get('chapter');
 return {section:course.id,chapterId:course.chapters.some(item=>item.id===requested)?requested!:'00'};
}
export function grammarHref(section:GrammarSection,chapterId='00'){
 const params=new URLSearchParams({section}),course=grammarCourse(section);
 if(course)params.set('chapter',course.chapters.some(item=>item.id===chapterId)?chapterId:'00');
 return `?${params}`;
}
export function linkedGrammarChapter(href:string,section:GrammarSection='grammar'){
 try{
  const file=decodeURIComponent(href).replace(/^\.\//,'');
  return grammarCourse(section)?.chapters.find(item=>item.file===file);
 }catch{return undefined;}
}
