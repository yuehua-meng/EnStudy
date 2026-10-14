import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';

// Evaluate the data module in memory rather than duplicating the vocabulary.
const vocabularySource = readFileSync(new URL('../lib/vocabulary.ts', import.meta.url), 'utf8');
const compiled = ts.transpile(vocabularySource, {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022});
const {words} = await import('data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'));
const articles = JSON.parse(readFileSync(new URL('../lib/reading-articles.json', import.meta.url), 'utf8'));
const voice = 'en_US-ljspeech-high';
const entries = [];
const textToFile = {};
function add(id, text) {
  const hash = createHash('sha256').update(voice + '\0' + text).digest('hex').slice(0, 24);
  const file = hash + '.mp3';
  textToFile[text] = file;
  entries.push({id, text, file});
}
for (const word of words) {
  add(`word-${word.id}`, word.word);
  word.examples.forEach((example, index) => add(`example-${word.id}-${index}`, example.en));
}
for (const article of articles) article.paragraphs.forEach((paragraph, index) => add(`reading-${article.id}-${index}`, paragraph.en));
add('voice-test', 'The constructor accepts a configuration object.');
const manifest = {voice, label: 'Piper · 美式英语女声', version: 1, textToFile};
const directory = fileURLToPath(new URL('../../deploy/piper/', import.meta.url));
mkdirSync(directory, {recursive: true});
writeFileSync(new URL('../lib/audio-manifest.json', import.meta.url), JSON.stringify(manifest, null, 2) + '\n');
writeFileSync(new URL('../public/audio-manifest.json', import.meta.url), JSON.stringify(manifest, null, 2) + '\n');
writeFileSync(directory + 'audio-jobs.json', JSON.stringify({voice, entries}, null, 2) + '\n');
console.log(JSON.stringify({words: words.length, examples: words.reduce((n, word) => n + word.examples.length, 0), paragraphs: articles.reduce((n, article) => n + article.paragraphs.length, 0),uniqueAudioFiles:new Set(entries.map(entry => entry.file)).size}));
