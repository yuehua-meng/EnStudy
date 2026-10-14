'use client';

import {useRef, useState} from 'react';
import {BookOpen, ChevronLeft, ChevronRight, ExternalLink, Eye, EyeOff, Headphones, Loader2, Square, Volume2} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {NativeSelect} from '@/components/ui/native-select';
import articles from '@/lib/reading-articles.json';
import type {SpeechState} from '@/lib/speech';

type Props = {
  articleId: string;
  onSelect: (id: string) => void;
  speech: SpeechState;
  onPlay: (id: string, text: string) => void;
  rate: number;
  onRateChange: (rate: number) => void;
  onSettings: () => void;
};

// The manuscript uses only bold text and inline code inside learning notes.
function InlineText({text}: {text: string}) {
  return <>{text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) =>
    part.startsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> :
    part.startsWith('`') ? <code key={i}>{part.slice(1, -1)}</code> : part
  )}</>;
}

export default function ReadingPanel({articleId, onSelect, speech, onPlay, rate, onRateChange, onSettings}: Props) {
  const [showTranslation, setShowTranslation] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const index = Math.max(0, articles.findIndex(article => article.id === articleId));
  const article = articles[index];

  function select(id: string) {
    onSelect(id);
    requestAnimationFrame(() => {
      heading.current?.focus({preventScroll: true});
      heading.current?.scrollIntoView({behavior: 'smooth', block: 'start'});
    });
  }

  return <section className="reading-layout" aria-label="短文阅读">
    <nav className="reading-catalog" aria-label="短文目录">
      <div className="reading-catalog-heading"><BookOpen size={18}/><h2>阅读目录</h2><span>10 篇</span></div>
      <p className="reading-catalog-note">从项目启动，到理解系统设计</p>
      <ol>{articles.map(item => <li key={item.id}>
        <button className={`reading-entry ${item.id === article.id ? 'active' : ''}`} aria-current={item.id === article.id ? 'page' : undefined} onClick={() => select(item.id)}>
          <span className="reading-number">{item.id}</span>
          <span className="reading-entry-copy"><b>{item.topic}</b><span lang="en">{item.title}</span><small>{item.wordCount} 词 · 4 段</small></span>
        </button>
      </li>)}</ol>
      <div className="reading-study-tip"><b>读懂 → 朗读 → 复述</b><p>先读一个自然段，再查看翻译；熟悉之后，试着用自己的话复述。</p></div>
    </nav>

    <article className="reading-article" aria-labelledby="reading-title">
      <header className="reading-header">
        <span className="eyebrow">DEVELOPER READINGS / {article.id}</span>
        <h2 id="reading-title" ref={heading} tabIndex={-1} lang="en">{article.title}</h2>
        <div className="reading-meta"><span>{article.topic}</span><span>{article.wordCount} 词</span><span>原创学习短文</span></div>
        <p className="reading-outline">背诵线索：{article.outline}</p>
        <div className="reading-toolbar">
          <Button variant="outline" size="sm" aria-pressed={showTranslation} onClick={() => setShowTranslation(show => !show)}>{showTranslation ? <EyeOff size={16}/> : <Eye size={16}/>} {showTranslation ? '隐藏中文翻译' : '显示中文翻译'}</Button>
          <NativeSelect aria-label="短文朗读语速" value={rate} onChange={event => onRateChange(Number(event.target.value))}><option value={1}>正常语速</option><option value={.8}>慢速朗读</option></NativeSelect>
          <Button variant="ghost" size="sm" onClick={onSettings}><Headphones size={16}/>声音设置</Button>
        </div>
        <p className="reading-audio-hint">点击段落旁的小喇叭朗读，再次点击停止。Piper 美式英语音频，无需安装手机语音包。</p>
      </header>

      <div className="reading-passages">{article.paragraphs.map((paragraph, i) => {
        const id = `reading-${article.id}-${i}`;
        const active = speech.id === id;
        return <section key={id} className={`reading-paragraph ${active ? 'is-speaking' : ''}`} aria-label={`第 ${i + 1} 段`}>
          <div className="reading-paragraph-top"><span>PARAGRAPH {String(i + 1).padStart(2, '0')}</span><Button variant="ghost" size="icon" className={`speaker ${active ? 'speaking' : ''}`} aria-label={`${active ? '停止' : '朗读'}第 ${i + 1} 段`} onClick={() => onPlay(id, paragraph.en)}>{active ? (speech.status === 'loading' ? <Loader2 className="animate-spin" size={17}/> : <Square size={16}/>) : <Volume2 size={19}/>}</Button></div>
          <p className="reading-english" lang="en">{paragraph.en}</p>
          {showTranslation && <p className="reading-translation" lang="zh-CN"><InlineText text={paragraph.zh}/></p>}
        </section>;
      })}</div>

      <div className="reading-notes" key={article.id}>
        <details open><summary>核心词汇与搭配 <span>{article.vocabulary.length} 组</span></summary><div className="reading-table-scroll"><table><thead><tr><th scope="col">表达</th><th scope="col">本文含义</th><th scope="col">联想记忆</th></tr></thead><tbody>{article.vocabulary.map(item => <tr key={item.term}><th scope="row" lang="en">{item.term}</th><td>{item.meaning}</td><td>{item.note}</td></tr>)}</tbody></table></div></details>
        <details><summary>文档句型拆解 <span>{article.patterns.length} 个句型</span></summary><ul>{article.patterns.map((text, i) => <li key={i}><InlineText text={text}/></li>)}</ul></details>
        <details><summary>复述与迁移 <span>把表达用在你的项目中</span></summary><ol>{article.exercises.map((text, i) => <li key={i}><InlineText text={text}/></li>)}</ol></details>
        <div className="reading-reference"><span className="small-label">延伸阅读 · 一手技术资料</span><a href={article.reference.url} target="_blank" rel="noreferrer">{article.reference.title}<ExternalLink size={14}/></a><p><InlineText text={article.reference.note}/></p></div>
      </div>

      <footer className="reading-pagination"><Button variant="outline" disabled={index === 0} onClick={() => select(articles[index - 1].id)}><ChevronLeft size={16}/>上一篇</Button><span>{index + 1} / {articles.length}</span><Button variant="outline" disabled={index === articles.length - 1} onClick={() => select(articles[index + 1].id)}>下一篇<ChevronRight size={16}/></Button></footer>
    </article>
  </section>;
}
