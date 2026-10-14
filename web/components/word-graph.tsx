'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {Minus,Plus,Maximize2,ChevronDown,ChevronRight} from 'lucide-react';
import {Tooltip,TooltipContent,TooltipTrigger} from '@/components/ui/tooltip';
import {Switch} from '@/components/ui/switch';
import type {Family,Word} from '@/lib/vocabulary';
type Props={family:Family;words:Word[];selected:string;onSelect:(id:string)=>void;onRoot:()=>void};
export default function WordGraph({family,words,selected,onSelect,onRoot}:Props){
 const [collapsed,setCollapsed]=useState<Set<string>>(new Set());const [meaning,setMeaning]=useState(false);const [zoom,setZoom]=useState(1);const [pan,setPan]=useState({x:0,y:0});
 const viewport=useRef<HTMLDivElement>(null);const [width,setWidth]=useState(900);const drag=useRef<{x:number;y:number;px:number;py:number}|null>(null);
 useEffect(()=>{if(!viewport.current)return;const ro=new ResizeObserver(e=>setWidth(e[0].contentRect.width));ro.observe(viewport.current);return()=>ro.disconnect();},[]);
 const effCollapsed=useMemo(()=>{const copy=new Set(collapsed);let current=words.find(w=>w.id===selected);while(current?.parent){copy.delete(current.parent);current=words.find(w=>w.id===current!.parent);}return copy;},[collapsed,words,selected]);
 // Keep geometry based on the complete tree so collapsing only changes visibility.
 const fullLayout=useMemo(()=>{
  const result:{w:Word;x:number;y:number;depth:number}[]=[];let row=0;let maxDepth=1;
  function visit(w:Word,depth:number){const children=words.filter(c=>c.parent===w.id);let y:number;
   if(children.length){const positions=children.map(c=>visit(c,depth+1));y=(positions[0]+positions[positions.length-1])/2;}else y=48+(row++)*85;
   result.push({w,x:0,y,depth});maxDepth=Math.max(maxDepth,depth);return y;
  }
  words.filter(w=>!w.parent).forEach(w=>{visit(w,1);row+=.25;});
  const graphWidth=Math.max(width,780,maxDepth*230+170);const step=(graphWidth-240)/maxDepth;
  result.forEach(n=>n.x=90+n.depth*step);
  return {nodes:result,height:Math.max(380,row*85+20),width:graphWidth,rootY:result.filter(n=>n.depth===1).reduce((s,n)=>s+n.y,0)/Math.max(1,words.filter(w=>!w.parent).length)};
 },[words,width]);
 const layout=useMemo(()=>{
  const byId=new Map(words.map(w=>[w.id,w]));
  const nodes=fullLayout.nodes.filter(({w})=>{
   let parent=w.parent;
   while(parent){if(effCollapsed.has(parent))return false;parent=byId.get(parent)?.parent;}
   return true;
  });
  return {...fullLayout,nodes};
 },[fullLayout,words,effCollapsed]);
 const activePath=new Set([selected]);let p=words.find(w=>w.id===selected);while(p?.parent){activePath.add(p.parent);p=words.find(w=>w.id===p!.parent);}
 const toggle=(id:string)=>setCollapsed(prev=>{const next=new Set(prev);if(effCollapsed.has(id))next.delete(id);else next.add(id);return next;});
 function node(w:Word){return <Tooltip><TooltipTrigger asChild><button aria-label={`查看 ${w.word}`} aria-pressed={selected===w.id} className={`word-node ${selected===w.id?'selected':''}`} onClick={()=>onSelect(w.id)}><b>{w.word}</b><small>{meaning?w.meaning:w.parent?'扩展词':'核心词'}</small></button></TooltipTrigger><TooltipContent sideOffset={10} className="word-tooltip"><b>{w.word}</b><p>美 /{w.ipa}/ · {w.pos}</p><p>{w.meaning}</p><span>{w.parent?`${w.parent} · ${w.relation}`:family.type==='root'?'历史词根关联':'现代词族入口'}</span></TooltipContent></Tooltip>;}
 return <section className="graph-section"><div className="graph-heading"><div><span className="family-title">{family.label}</span><span className="family-divider">/</span><span>{family.meaning}</span></div><div className="graph-options"><label htmlFor="show-meaning">显示中文</label><Switch id="show-meaning" checked={meaning} onCheckedChange={setMeaning}/><span className="small-label">{words.length} 个词</span></div></div>
 <div className="graph-viewport" ref={viewport} style={{height:Math.max(350,layout.height*Math.min(1,width/layout.width))}} onPointerDown={e=>{if((e.target as HTMLElement).closest('button')||e.pointerType==='touch')return;drag.current={x:e.clientX,y:e.clientY,px:pan.x,py:pan.y};e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={e=>{if(drag.current)setPan({x:drag.current.px+e.clientX-drag.current.x,y:drag.current.py+e.clientY-drag.current.y});}} onPointerUp={()=>drag.current=null} onPointerCancel={()=>drag.current=null}>
 <div className="graph-transform" style={{width:layout.width,height:layout.height,transform:`translate(${pan.x}px,${pan.y}px) scale(${zoom*Math.min(1,width/layout.width)})`}}><svg width={layout.width} height={layout.height} aria-hidden="true">{layout.nodes.map(n=>{const parent=layout.nodes.find(p=>p.w.id===n.w.parent);const start={x:parent?.x??90,y:parent?.y??layout.rootY};const mid=(start.x+n.x)/2;return <g key={n.w.id}><path className={activePath.has(n.w.id)?'active-edge':''} d={`M ${start.x} ${start.y} C ${mid} ${start.y},${mid} ${n.y},${n.x} ${n.y}`}/><text x={mid} y={(start.y+n.y)/2-10} textAnchor="middle">{parent?n.w.relation:family.type==='root'?'同词根':'词族入口'}</text></g>})}</svg>
 <button className="root-node" style={{left:90,top:layout.rootY}} onClick={onRoot} aria-label={`查看 ${family.label} 词族说明`}>{family.type==='root'?`-${family.label}-`:family.label}<small>{family.type==='root'?'历史词根':'现代词基'}</small></button>
 {layout.nodes.map(n=><div className="node-wrap" style={{left:n.x,top:n.y}} key={n.w.id}>{node(n.w)}{words.some(w=>w.parent===n.w.id)&&<button className="branch-toggle" aria-label={`${effCollapsed.has(n.w.id)?'展开':'收起'} ${n.w.word} 分支`} aria-expanded={!effCollapsed.has(n.w.id)} onClick={()=>toggle(n.w.id)}>{effCollapsed.has(n.w.id)?<Plus size={12}/>:<Minus size={12}/>}</button>}</div>)}</div>
 <div className="graph-tools"><button aria-label="缩小图谱" onClick={()=>setZoom(z=>Math.max(.55,z-.1))}><Minus size={16}/></button><span>{Math.round(zoom*100)}%</span><button aria-label="放大图谱" onClick={()=>setZoom(z=>Math.min(1.5,z+.1))}><Plus size={16}/></button><button aria-label="适应图谱" onClick={()=>{setZoom(1);setPan({x:0,y:0});}}><Maximize2 size={16}/></button></div></div>
 <div className="mobile-tree"><button className="mobile-root" onClick={onRoot}>{family.label} · {family.meaning}</button>{(()=>{const ordered:typeof layout.nodes=[];function walk(parent?:string){for(const w of words.filter(w=>w.parent===parent)){const n=layout.nodes.find(n=>n.w.id===w.id);if(n){ordered.push(n);walk(w.id);}}}walk();return ordered;})().map(n=><div key={n.w.id} className="mobile-tree-row" style={{paddingLeft:Math.min(n.depth-1,2)*18}}><div>{node(n.w)}<small>{n.w.parent?`${n.w.parent} · ${n.w.relation}`:'核心词'}</small></div>{words.some(w=>w.parent===n.w.id)&&<button className="icon-button" onClick={()=>toggle(n.w.id)} aria-label={`${effCollapsed.has(n.w.id)?'展开':'收起'} ${n.w.word} 分支`}>{effCollapsed.has(n.w.id)?<ChevronRight size={16}/>:<ChevronDown size={16}/>}</button>}</div>)}</div>
 <div className="graph-caption"><span>悬浮查词 · 点击读例句 · 拖动空白处平移</span><span>连线标签说明关系类型</span></div></section>
}
