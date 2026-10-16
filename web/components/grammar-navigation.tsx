import {useEffect,useState} from 'react';
import {BookOpen,ChevronDown,ChevronRight,GraduationCap,Headphones} from 'lucide-react';
import {SidebarMenuButton,SidebarMenuItem,SidebarMenuSub,SidebarMenuSubButton,SidebarMenuSubItem} from '@/components/ui/sidebar';
import {courses,grammarHref,type CourseSection,type GrammarSection} from '@/lib/grammar';

type Props={active:boolean;section:GrammarSection;chapterId:string;onOpen:()=>void;onSelect:(section:GrammarSection,id:string,closeMobile?:boolean)=>void};
export default function GrammarNavigation({active,section,chapterId,onOpen,onSelect}:Props){
 const [expanded,setExpanded]=useState(active),[openCourse,setOpenCourse]=useState<CourseSection|null>(section),[filter,setFilter]=useState('');
 useEffect(()=>{if(active)setExpanded(true);},[active]);
 useEffect(()=>{setOpenCourse(section);setFilter('');},[section]);
 return <SidebarMenuItem>
  <SidebarMenuButton isActive={active} aria-expanded={expanded} aria-controls="grammar-navigation" onClick={()=>{setExpanded(!expanded);if(!expanded)onOpen();}}><GraduationCap size={18}/><span>音标语法讲解</span>{expanded?<ChevronDown className="ml-auto"/>:<ChevronRight className="ml-auto"/>}</SidebarMenuButton>
  {expanded&&<SidebarMenuSub id="grammar-navigation" className="grammar-nav-sub">
   {courses.map(course=>{
    const isOpen=openCourse===course.id,isActive=active&&section===course.id;
    const visible=course.chapters.filter(item=>`${item.id} ${item.title}`.toLowerCase().includes(filter.trim().toLowerCase()));
    const Icon=course.id==='grammar'?BookOpen:Headphones;
    return <SidebarMenuSubItem key={course.id}>
     <SidebarMenuSubButton asChild isActive={isActive}><button type="button" aria-expanded={isOpen} aria-controls={`${course.id}-chapters`} onClick={()=>{setOpenCourse(isOpen?null:course.id);setFilter('');onSelect(course.id,isActive?chapterId:'00',false);}}><Icon/><span>{course.label}</span>{isOpen?<ChevronDown className="ml-auto"/>:<ChevronRight className="ml-auto"/>}</button></SidebarMenuSubButton>
     {isOpen&&<div id={`${course.id}-chapters`} className="grammar-chapter-tree"><label className="sr-only" htmlFor={`${course.id}-chapter-filter`}>筛选{course.label}章节</label><input id={`${course.id}-chapter-filter`} type="search" value={filter} placeholder="查找章节…" onChange={event=>setFilter(event.target.value)}/><ul aria-label={`${course.label}章节`}>{visible.map(item=><li key={item.id}><a href={grammarHref(course.id,item.id)} className={isActive&&chapterId===item.id?'active':''} aria-current={isActive&&chapterId===item.id?'page':undefined} onClick={event=>{if(event.button||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();onSelect(course.id,item.id);}}><span className="grammar-chapter-number">{item.id}</span><span>{item.title}</span></a></li>)}</ul>{!visible.length&&<p className="small-label">没有匹配的章节</p>}</div>}
    </SidebarMenuSubItem>;
   })}
  </SidebarMenuSub>}
 </SidebarMenuItem>;
}
