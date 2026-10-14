import json
from pathlib import Path

folder = Path(__file__).resolve().parent
source = folder / 'computing-100-2026-10-04.source.txt'
labels = {
    'execute':'执行', 'allocate':'内存与资源分配', 'serialize':'序列化',
    'validate':'有效性校验', 'authenticate':'身份认证', 'authorize':'访问授权',
    'crypt':'加密与密码学', 'persist':'持久化', 'iterate':'迭代与遍历',
    'recurse':'递归', 'compose':'组合与分解', 'resolve':'解析与解决',
    'optimize':'性能优化', 'compress':'压缩与解压', 'replicate':'复制与副本',
    'distribute':'分发与分布式', 'concurrent':'并发', 'parallel':'并行',
    'performance':'性能指标', 'coordination':'线程协调', 'idempotent':'幂等性',
    'atomic':'原子性', 'encapsulate':'封装', 'inherit':'继承', 'instance':'实例化',
    'object-model':'对象与类型系统', 'polymorphism':'多态', 'interrupt':'中断',
    'buffer':'缓冲', 'network':'网络通信'
}
topic_groups = {'crypt','performance','coordination','object-model','network'}
notes = {
    'execute':'通常指执行程序、命令或任务；这里不收录非技术义项。',
    'serializable':'本条为“可序列化的”。数据库隔离级别 SERIALIZABLE 通常译为“可串行化”，是另一技术义项。',
    'authentication':'回答“你是谁”；与决定访问权限的 authorization 区分。',
    'authorization':'回答“你可以访问什么或执行什么”；与 authentication 区分。',
    'unauthorized':'普通技术形容词表示未经授权；HTTP 401 的协议语义涉及缺少有效认证凭据，不能只按中文词面判断状态码。',
    'concurrency':'多个任务的执行进程在时间上重叠，可能交替推进，不要求同一瞬间在多个核心上执行。',
    'parallelism':'多个计算在同一时间实际执行；与 concurrency 的侧重点不同。',
    'idempotent':'重复执行与执行一次具有相同的预期作用，不要求每次响应内容或状态码完全相同。',
    'idempotency':'另一常见名词形式是 idempotence；本条优先收录 API 文档中常见的 idempotency。',
    'atomic':'针对具体操作及其契约理解“不可分割”；不能假定任意一行代码都是原子的。',
    'atomicity':'事务语境强调全部成功或全部不生效；并发原子操作则需结合其可观察效果理解。',
    'replica':'副本通常用于复制、读取或可用性；持续同步的副本不能自动替代备份。',
    'resolve':'具体意义取决于对象：hostname 是名称解析，dependency 是依赖解析，conflict 是解决冲突。',
    'override':'方法重写通常发生于继承或接口实现语境；不要与改变参数列表的方法重载 overload 混淆。',
    'overload':'是否支持方法或运算符重载、如何选择实现，取决于编程语言。',
    'buffering':'-ing 名词用法，作为独立技术过程收录，不将所有动词屈折形式机械扩充为新词。',
    'distributed':'过去分词用作形容词，在 distributed system 等技术表达中有独立学习价值。'
}
references = [
    {'id':'python-glossary','title':'Python 官方术语表','url':'https://docs.python.org/3/glossary.html'},
    {'id':'mdn-serialization','title':'MDN：Serialization','url':'https://developer.mozilla.org/en-US/docs/Glossary/Serialization'},
    {'id':'mdn-idempotent','title':'MDN：Idempotent','url':'https://developer.mozilla.org/en-US/docs/Glossary/Idempotent'},
    {'id':'postgres-isolation','title':'PostgreSQL：事务隔离','url':'https://www.postgresql.org/docs/current/transaction-iso.html'}
]
items = []
for number,line in enumerate(source.read_text(encoding='utf-8').splitlines(),1):
    fields = line.split('|')
    assert len(fields)==10, (number,len(fields))
    word,ipa,pos,meaning,group,parent,relation,en,zh,phrases=fields
    if word in ('interrupt','interruption'):
        ipa=ipa.replace('ɪntə','ɪntɚ')
    relation_type = ('technical_related' if relation.startswith('技术') else
                     'inflection' if relation.startswith('过去分词') else
                     'derivation' if relation.startswith('加') else
                     'word_family' if relation else 'group_entry')
    ref=[]
    if group=='serialize':ref=['mdn-serialization']
    if group=='idempotent':ref=['mdn-idempotent']
    if group in ('iterate','concurrent','parallel','atomic'):ref=['python-glossary']
    if word=='serializable':ref.append('postgres-isolation')
    items.append({
        'id':word, 'word':word,
        'pronunciation':{'locale':'en-US','ipa':f'/{ipa}/'},
        'partOfSpeech':pos,'meaningZh':meaning,'groupId':group,
        'parentWordId':parent or None,
        'relationship':{'type':relation_type,'label':relation or '学习入口'},
        'collocations':phrases.split(';'),
        'examples':[{'en':en,'zh':zh,'domain':labels[group],'origin':'original'}],
        'usageNote':notes.get(word,''),
        'referenceIds':ref,
        'dictionaryUrl':f'https://dictionary.cambridge.org/dictionary/english/{word}'
    })

# Validate only this newly authored supplement; do not read the application.
previous = set('construct constructor construction reconstruct structure structural restructure instruct instruction infrastructure import importer importable export exporter exportable portable portability form format formatting transform transformation transformer formal formalize extract extraction extractor abstract abstraction abstractly subtract subtraction inspect inspection inspector introspect introspection retrospect retrospective script scripting describe description descriptive subscribe subscriber subscription unsubscribe compile compiler compilation recompile decompile decompiler recompilation parse parser parsing reparse parseable configure configuration configurable reconfigure misconfigure misconfiguration depend dependent dependency independent independence interdependent interdependency mutate mutation mutant mutable immutable immutability synchronous asynchronous synchronize synchronization async sync asynchronously argument parameter exception invalid deprecated undefined request response endpoint payload timeout retry build deploy release artifact environment rollback query schema transaction cache index constraint debug trace assert mock merge conflict review approve'.split())
assert len(items)==100, len(items)
ids={w['id'] for w in items}
assert len(ids)==100
assert not ids & previous, ids & previous
for w in items:
    assert w['groupId'] in labels
    assert not w['parentWordId'] or w['parentWordId'] in ids
    assert all(w[k] for k in ('word','partOfSpeech','meaningZh','collocations','examples'))
    assert w['examples'][0]['en'] and w['examples'][0]['zh']
    visited={w['id']};p=w['parentWordId']
    while p:
        assert p not in visited, ('cycle',w['id'])
        visited.add(p);p=next(v for v in items if v['id']==p)['parentWordId']

groups=[{'id':key,'label':key,'meaningZh':value,'type':'topic' if key in topic_groups else 'word_family'} for key,value in labels.items()]
payload={
 'schemaVersion':1,'title':'程序员计算机英语补充词库 · 100 词',
 'createdDate':'2026-10-04','wordCount':len(items),'exampleCount':len(items),
 'notes':[
  '本文件为独立补充词库，没有读取或修改现有应用。字段映射由接入方根据当前项目结构决定。',
  '已与本对话此前整理的 120 词去重，未与用户后来使用其他软件扩充的词库比对。',
  '按现代词族与技术场景组织，不把这些入口全部宣称为历史词根。word_family 关系不表示历史直接派生。',
  '释义和例句为原创教学内容；参考资料支持部分技术概念，不代表整批音标已由词典逐条核验。',
  '音标提供一种常见美式读法，未附音频；朗读应传 word 或 examples[].en，不传 IPA。',
  'dictionaryUrl 是查词入口，不代表该网站必有每个派生词的独立页面。'
 ],'groups':groups,'words':items,'references':references
}
out=folder/'computing-100-2026-10-04.json'
out.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
lines=['# 计算机英语补充词库：100 个词','',
       '2026-10-04 · 100 个词条 · 100 条原创双语技术例句 · 30 个词族／场景组','',
       '相较本对话此前整理的 120 词无重复。本次只补充独立词库，不修改应用。','',
       '每词提供美式 IPA、词性、中文技术释义、词族关系、常见搭配和例句。分组是现代词族或技术场景，不等同于严格的历史词根。','',
       'JSON 中 `parentWordId` 可用于画连线；`relationship.type` 区分派生、同族、屈折和技术关联。根级词条的 `parentWordId` 为 null。朗读使用 `word` 或 `examples[].en`。','',
       '音标提供一种常见美式读法；未做整批词典逐条音标核验。','']
for group,label in labels.items():
    subset=[w for w in items if w['groupId']==group]
    lines.extend([f'## {label}（{group}）','', '| 单词 | 美式音标 | 词性 | 含义 |','| --- | --- | --- | --- |'])
    for w in subset:lines.append(f"| {w['word']} | {w['pronunciation']['ipa']} | {w['partOfSpeech']} | {w['meaningZh']} |")
    lines.append('')
    for w in subset:
        e=w['examples'][0]
        lines.extend([f"**{w['word']}**",'',e['en'],'',e['zh'],'',f"搭配：{'；'.join(w['collocations'])}",''])
        if w['parentWordId']:lines.extend([f"关系：{w['parentWordId']} → {w['word']}（{w['relationship']['label']}）",''])
        if w['usageNote']:lines.extend([f"用法提示：{w['usageNote']}",''])
    if group in ('iterate','concurrent','parallel','atomic'):lines.extend(['技术概念参考：[Python 官方术语表](https://docs.python.org/3/glossary.html)。',''])
    if group=='serialize':lines.extend(['技术概念参考：[MDN：序列化](https://developer.mozilla.org/en-US/docs/Glossary/Serialization)、[PostgreSQL：事务隔离](https://www.postgresql.org/docs/current/transaction-iso.html)。',''])
    if group=='idempotent':lines.extend(['技术概念参考：[MDN：幂等性](https://developer.mozilla.org/en-US/docs/Glossary/Idempotent)。',''])
(folder/'computing-100-2026-10-04.md').write_text('\n'.join(lines),encoding='utf-8')
reloaded=json.loads(out.read_text(encoding='utf-8'))
assert reloaded['wordCount']==len(reloaded['words'])==100
print(json.dumps({'words':len(items),'examples':len(items),'groups':len(groups),'duplicatesWithinSupplement':0,'overlapWithPreviousConversationList':0,'parentReferences':'valid and acyclic','outputs':[out.name,'computing-100-2026-10-04.md']},ensure_ascii=False))
