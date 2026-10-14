import {readFileSync, writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';

// Keep the learning manuscript as the source of truth for the reading page.
const source = readFileSync(new URL('../../docs/程序员英语精读与背诵-10篇核心文章.md', import.meta.url), 'utf8');
const sections = [...source.matchAll(/^## (\d{2})\. (.+)\r?\n([\s\S]*?)(?=^## \d{2}\. |^## 十篇学完后的综合练习)/gm)];
function section(content, heading) {
  const start = content.indexOf(`### ${heading}\n`);
  assert.ok(start >= 0, `Missing section: ${heading}`);
  return content.slice(start + heading.length + 5).split(/\n### |\n\*\*延伸阅读/)[0].trim();
}
const articles = sections.map(([, id, title, raw]) => {
  const content = raw.replace(/\r/g, '');
  const meta = content.match(/\*\*主题：(.+?)。背诵线索：(.+?)。\*\*/);
  assert.ok(meta, `Missing metadata: ${id}`);
  const english = section(content, '英文正文').split(/\n\s*\n/);
  const chinese = section(content, '中文对照').split('\n').filter(Boolean).map(line => line.replace(/^\d+\. /, ''));
  const vocabulary = section(content, '核心词汇与搭配').split('\n').slice(2).filter(line => line.startsWith('|')).map(line => {
    const [term, meaning, note] = line.split('|').slice(1, -1).map(value => value.trim());
    return {term, meaning, note};
  });
  const patterns = section(content, '文档句型拆解').split('\n').filter(line => line.startsWith('- ')).map(line => line.slice(2));
  const exercises = section(content, '复述与迁移').split('\n').filter(line => line.startsWith('- ')).map(line => line.slice(2));
  const reference = content.match(/\*\*延伸阅读：\*\* \[([^\]]+)\]\((https:\/\/[^)]+)\)。([^\n]+)/);
  assert.ok(reference, `Missing reference: ${id}`);
  assert.equal(english.length, 4, `${id}: paragraph count`);
  assert.equal(chinese.length, english.length, `${id}: translations`);
  assert.equal(vocabulary.length, 8, `${id}: vocabulary`);
  assert.equal(patterns.length, 3, `${id}: patterns`);
  assert.equal(exercises.length, 2, `${id}: exercises`);
  return {
    id, title, topic: meta[1], outline: meta[2],
    wordCount: (english.join(' ').match(/[A-Za-z]+(?:['’-][A-Za-z]+)*/g) || []).length,
    paragraphs: english.map((en, i) => ({en, zh: chinese[i]})),
    vocabulary, patterns, exercises,
    reference: {title: reference[1], url: reference[2], note: reference[3]},
  };
});
assert.equal(articles.length, 10);
assert.equal(new Set(articles.map(article => article.id)).size, articles.length);
writeFileSync(new URL('../lib/reading-articles.json', import.meta.url), JSON.stringify(articles, null, 2) + '\n');
console.log(`Synced ${articles.length} articles, ${articles.reduce((sum, article) => sum + article.wordCount, 0)} English words.`);
