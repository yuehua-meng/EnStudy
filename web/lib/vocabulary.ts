export type Example = {en:string;zh:string;topic:string};
export type Word = {id:string;word:string;ipa:string;pos:string;meaning:string;family:string;parent?:string;relation:string;kind:'root'|'derivation'|'family';examples:Example[];phrases:string[];topic:string;note?:string};
export type Family = {id:string;label:string;meaning:string;type:'root'|'base';description:string;source:string};
export const families:Family[]=[{id:'struct',label:'struct',meaning:'建造与组织',type:'root',description:'从“把各部分组织起来”出发，理解构造、结构和指令。历史同源关系与现代构词分别标记。',source:'https://www.etymonline.com/word/structure'}];
export const words:Word[]=[];
export function add(family:string,topic:string,rows:string){for(const line of rows.trim().split('\n')){const [word,ipa,pos,meaning,parent,relation,en1,zh1,en2,zh2,phrases,note]=line.split('|');words.push({id:word,word,ipa,pos,meaning,family,parent:parent||undefined,relation:relation||'同词根',kind:!parent?'root':relation?.includes('同族')?'family':'derivation',examples:[{en:en1,zh:zh1,topic},{en:en2,zh:zh2,topic}],phrases:(phrases||'').split(';').filter(Boolean),topic,note:note||undefined});}}
add('struct','语言与结构',`
construct|kənˈstrʌkt|v.|构造；构建|||Construct a URL from the base path.|根据基础路径构造一个 URL。|The function constructs a tree from the input data.|这个函数根据输入数据构建一棵树。|construct a URL;construct an object
constructor|kənˈstrʌktɚ|n.|构造函数；构造方法|construct|+ -or|The constructor accepts a configuration object.|这个构造函数接收一个配置对象。|Avoid making network requests inside the constructor.|避免在构造函数内部发起网络请求。|class constructor;constructor parameter
construction|kənˈstrʌkʃən|n.|构造；创建过程|construct|同族对应|Object construction can fail if the configuration is invalid.|如果配置无效，对象构造可能会失败。|Move the construction of the lookup table outside the loop.|将查找表的构造移到循环外。|object construction;query construction
reconstruct|ˌriːkənˈstrʌkt|v.|重建|construct|+ re-|Reconstruct the object from the saved data.|根据保存的数据重建对象。|The debugger can reconstruct the call sequence.|调试器可以重建调用顺序。|reconstruct an object;reconstruct the state
structure|ˈstrʌktʃɚ|n.|结构；数据结构|||Choose a data structure that supports fast lookups.|选择支持快速查找的数据结构。|The new module has a clear structure.|新模块的结构很清晰。|data structure;directory structure
structural|ˈstrʌktʃɚəl|adj.|结构的|structure|+ -al，去 e|The validator checks for structural errors.|校验器检查结构错误。|This refactor introduces several structural changes.|这次重构引入了几项结构性变更。|structural change;structural typing
restructure|ˌriːˈstrʌktʃɚ|v.|调整结构；重新组织|structure|+ re-|Restructure the module to separate parsing from validation.|调整模块结构，将解析和校验分开。|We need to restructure the project directories.|我们需要重新组织项目目录。|restructure a module;restructure the code
instruct|ɪnˈstrʌkt|v.|指示；指导|||Instruct the client to retry the request.|指示客户端重试请求。|The header instructs the browser not to cache the response.|这个头字段指示浏览器不要缓存响应。|instruct the client;instruct the browser
instruction|ɪnˈstrʌkʃən|n.|指令；操作说明|instruct|同族对应|The processor executes one instruction at a time.|处理器一次执行一条指令。|Follow the installation instructions carefully.|请仔细遵循安装说明。|machine instruction;installation instructions
infrastructure|ˈɪnfrəˌstrʌktʃɚ|n.|基础设施|structure|同族：infra- + structure|The team manages infrastructure through code.|团队通过代码管理基础设施。|Monitor the infrastructure during deployment.|在部署期间监控基础设施。|cloud infrastructure;infrastructure as code
`);
families.push(
 {id:'port',label:'port',meaning:'携带与传送',type:'root',description:'把内容带入、带出或带到别的平台。这里学习“携带”相关词族，不将网络端口的含义混入同一条解释。',source:'https://www.etymonline.com/word/portable'},
 {id:'form',label:'form',meaning:'形状与转换',type:'root',description:'从形式到变换，理解数据如何被组织和转换。同族对应不表示英语中的直接历史派生。',source:'https://www.etymonline.com/word/form'},
 {id:'tract',label:'tract',meaning:'拉取与抽取',type:'root',description:'从整体中取出一部分，连接提取、抽象和减法的词族。',source:'https://www.etymonline.com/word/extract'},
 {id:'spect',label:'spect',meaning:'观察与检查',type:'root',description:'从“看”出发，延伸到检查、内省与回顾。',source:'https://www.etymonline.com/word/inspect'},
 {id:'script',label:'scrib / script',meaning:'书写与描述',type:'root',description:'历史词根的两种形式。脚本、描述和订阅属于相近的词源网络。',source:'https://www.etymonline.com/word/script'},
 {id:'compile',label:'compile',meaning:'编译与还原',type:'base',description:'以现代完整单词 compile 为入口，学习编译工具和相关过程。',source:'https://www.etymonline.com/word/compile'},
 {id:'parse',label:'parse',meaning:'解析与读取',type:'base',description:'以 parse 为词基，通过后缀和前缀区分解析器、解析过程与重新解析。',source:'https://www.etymonline.com/word/parse'},
 {id:'configure',label:'configure',meaning:'配置与调整',type:'base',description:'配置是什么、能否配置、是否配置错误：在同一个词族中理解这些表达。',source:'https://www.etymonline.com/word/configure'},
 {id:'depend',label:'depend',meaning:'依赖与独立',type:'base',description:'理解代码、模块和服务之间的依赖关系。',source:'https://www.etymonline.com/word/depend'},
 {id:'mutate',label:'mutate',meaning:'变化与可变性',type:'base',description:'把动词“改变”、形容词“可变”和名词“不可变性”放在一起理解。',source:'https://www.etymonline.com/word/mutation'},
 {id:'sync',label:'sync',meaning:'同步与异步',type:'base',description:'以同步词族为入口。sync 和 async 是缩略形式，不能当作历史词根。',source:'https://www.etymonline.com/word/synchronous'}
);
add('port','API 与网络',`
import|ɪmˈpɔːrt|v.|导入|||Import the utility from the shared module.|从共享模块导入这个工具函数。|The tool can import records from a CSV file.|这个工具可以从 CSV 文件导入记录。|import a module;import data
importer|ɪmˈpɔːrtɚ|n.|导入器；导入工具|import|+ -er|The importer skips empty rows.|导入工具会跳过空行。|Configure the importer before loading the file.|加载文件前先配置导入工具。|CSV importer;data importer
importable|ɪmˈpɔːrtəbəl|adj.|可导入的|import|+ -able|Make the helper importable from the package root.|让这个辅助函数可以从包的根入口导入。|The module is importable after installation.|安装后就可以导入该模块。|importable module;importable package
export|ɪkˈspɔːrt|v.|导出|||Export the report as a JSON file.|将报告导出为 JSON 文件。|This module exports a single function.|这个模块导出一个函数。|export data;export a function
exporter|ɪkˈspɔːrtɚ|n.|导出器；导出工具|export|+ -er|The exporter writes metrics to a remote server.|导出器将指标写入远程服务器。|Restart the exporter after changing its settings.|更改设置后重新启动导出器。|metrics exporter;data exporter
exportable|ɪkˈspɔːrtəbəl|adj.|可导出的|export|+ -able|The results are exportable as plain text.|这些结果可以导出为纯文本。|Only public fields are exportable.|只有公开字段可以导出。|exportable data;exportable report
portable|ˈpɔːrtəbəl|adj.|可移植的|||Write portable code that avoids platform-specific APIs.|编写可移植代码，避免使用平台专有 API。|This library is portable across several operating systems.|这个库可以移植到多个操作系统。|portable code;portable library
portability|ˌpɔːrtəˈbɪləti|n.|可移植性|portable|同族：-able / -ability|The wrapper improves the portability of the application.|这个封装层提高了应用的可移植性。|Test portability on both Linux and Windows.|在 Linux 和 Windows 上测试可移植性。|code portability;cross-platform portability
`);
add('form','数据处理',`
form|fɔːrm|n.|表单；形式|||Validate the form before submitting it.|提交前校验表单。|The form contains three required fields.|这个表单包含三个必填字段。|form validation;form submission
format|ˈfɔːrmæt|n./v.|格式；格式化|form|同族对应|Format the timestamp as an ISO string.|将时间戳格式化为 ISO 字符串。|The parser does not support this file format.|解析器不支持这种文件格式。|file format;format a date
formatting|ˈfɔːrmætɪŋ|n.|格式设置；格式化过程|format|+ -ing，双写 t|The linter checks formatting in every file.|代码检查工具检查每个文件的格式。|Keep formatting changes in a separate commit.|将格式变更放在单独的提交中。|code formatting;date formatting
transform|trænsˈfɔːrm|v.|转换；变换|||Transform the response into a list of objects.|将响应转换成对象列表。|The pipeline transforms raw events into metrics.|这条流水线将原始事件转换为指标。|transform data;transform a response
transformation|ˌtrænsfɚˈmeɪʃən|n.|转换；变换|transform|同族对应|Apply the transformation before saving the data.|保存数据前应用这项转换。|This transformation preserves the original order.|这项转换保留原始顺序。|data transformation;type transformation
transformer|trænsˈfɔːrmɚ|n.|转换器|transform|+ -er|The transformer converts the syntax tree into code.|转换器将语法树转换成代码。|Register a custom transformer for this format.|为这种格式注册一个自定义转换器。|code transformer;custom transformer
formal|ˈfɔːrməl|adj.|形式的；正式的|form|同族对应|The protocol has a formal specification.|这个协议有一份形式化规范。|Formal verification can reveal errors in the model.|形式化验证可以揭示模型中的错误。|formal specification;formal verification
formalize|ˈfɔːrməlaɪz|v.|形式化；明确规定|formal|+ -ize|Formalize the requirements before implementation.|实现之前先明确规定需求。|We can formalize the rule as a constraint.|我们可以将这条规则形式化为一个约束。|formalize a rule;formalize requirements
`);
add('tract','数据处理',`
extract|ɪkˈstrækt|v.|提取|||Extract the user ID from the token.|从令牌中提取用户 ID。|This function extracts links from an HTML document.|这个函数从 HTML 文档中提取链接。|extract a value;extract data
extraction|ɪkˈstrækʃən|n.|提取过程|extract|同族对应|Data extraction runs every night.|数据提取每天晚上运行。|The extraction step removes unnecessary fields.|提取步骤会去掉不必要的字段。|data extraction;feature extraction
extractor|ɪkˈstræktɚ|n.|提取器|extract|+ -or|The extractor reads metadata from each file.|提取器从每个文件读取元数据。|Write a custom extractor for this document type.|为这种文档类型编写自定义提取器。|metadata extractor;feature extractor
abstract|ˈæbstrækt|adj.|抽象的|||An abstract class cannot be instantiated directly in Java.|在 Java 中，抽象类不能直接实例化。|Define an abstract interface for storage operations.|为存储操作定义一个抽象接口。|abstract class;abstract method
abstraction|æbˈstrækʃən|n.|抽象；抽象层|abstract|同族对应|This abstraction hides the database details.|这个抽象层隐藏了数据库细节。|Avoid adding an abstraction without a clear need.|避免在没有明确需求时增加抽象层。|abstraction layer;data abstraction
abstractly|ˈæbstræktli|adv.|抽象地|abstract|+ -ly|Describe the operation abstractly before choosing an algorithm.|选择算法之前先抽象地描述该操作。|Think abstractly about the data flow.|从抽象层面思考数据流。|describe abstractly;think abstractly
subtract|səbˈtrækt|v.|减去|||Subtract the start time from the end time.|用结束时间减去开始时间。|Subtract one from the counter after each retry.|每次重试后将计数器减一。|subtract a value;subtract one
subtraction|səbˈtrækʃən|n.|减法|subtract|同族对应|Integer subtraction can overflow.|整数减法可能溢出。|The expression uses subtraction to calculate the difference.|这个表达式使用减法计算差值。|integer subtraction;subtraction operator
`);
add('spect','调试与协作',`
inspect|ɪnˈspekt|v.|检查；查看|||Inspect the response headers in the browser.|在浏览器中查看响应头。|Inspect the stack trace to find the failing function.|查看堆栈跟踪以找到出错的函数。|inspect an element;inspect the response
inspection|ɪnˈspekʃən|n.|检查|inspect|同族对应|Manual inspection revealed a missing field.|人工检查发现了一个缺失字段。|The code inspection identified an unsafe cast.|代码检查发现了一处不安全的类型转换。|code inspection;manual inspection
inspector|ɪnˈspektɚ|n.|检查器；检查工具|inspect|+ -or|Open the network inspector to view the request.|打开网络检查工具以查看请求。|The inspector shows the current value of each variable.|检查器显示每个变量的当前值。|network inspector;object inspector
introspect|ˌɪntrəˈspekt|v.|内省；检查自身结构|||The library can introspect an object at runtime.|这个库可以在运行时内省对象。|Use this tool to introspect the database schema.|使用这个工具检查数据库模式。|introspect an object;introspect a schema
introspection|ˌɪntrəˈspekʃən|n.|内省；自省|introspect|同族对应|Introspection exposes the available fields of a type.|内省可以展示一个类型有哪些字段。|Disable schema introspection when the deployment requires it.|部署要求关闭模式内省时，将其禁用。|schema introspection;runtime introspection
retrospect|ˈretrəspekt|n.|回顾|||In retrospect, the migration needed more tests.|回顾来看，这次迁移需要更多测试。|The design seems simpler in retrospect.|事后回顾时，这个设计显得更简单。|in retrospect;review in retrospect
retrospective|ˌretrəˈspektɪv|n./adj.|复盘会议；回顾的|retrospect|同族对应|Discuss the deployment failure in the retrospective.|在复盘会上讨论这次部署失败。|The team holds a retrospective after each sprint.|团队在每个迭代结束后举行复盘会议。|sprint retrospective;retrospective meeting
`);
add('script','语言与结构',`
script|skrɪpt|n.|脚本|||Run the script from the project root.|从项目根目录运行脚本。|The script creates a backup of the database.|这个脚本会创建数据库备份。|shell script;build script
scripting|ˈskrɪptɪŋ|n.|脚本编写|script|+ -ing|Scripting helps automate repetitive tasks.|编写脚本有助于自动处理重复任务。|The tool supports scripting in Python.|这个工具支持使用 Python 编写脚本。|scripting language;shell scripting
describe|dɪˈskraɪb|v.|描述|||Describe the expected behavior in the test.|在测试中描述预期行为。|The README describes how to configure the service.|README 描述了如何配置服务。|describe behavior;describe an interface
description|dɪˈskrɪpʃən|n.|描述；说明|describe|同族：scrib / script|Add a short description to each parameter.|为每个参数添加简短说明。|The error description explains why validation failed.|错误说明解释了校验失败的原因。|error description;parameter description
descriptive|dɪˈskrɪptɪv|adj.|描述性的|describe|同族对应|Use descriptive names for your variables.|为变量使用描述性名称。|Return a descriptive error message.|返回一条说明清晰的错误消息。|descriptive name;descriptive message
subscribe|səbˈskraɪb|v.|订阅|||Subscribe to the stream before sending events.|发送事件前先订阅这个流。|Clients can subscribe to updates for a specific topic.|客户端可以订阅某个主题的更新。|subscribe to events;subscribe to a topic
subscriber|səbˈskraɪbɚ|n.|订阅者|subscribe|+ -er，去 e|Each subscriber receives the same event.|每个订阅者都会收到相同的事件。|Remove the subscriber when the component unmounts.|组件卸载时移除订阅者。|event subscriber;active subscriber
subscription|səbˈskrɪpʃən|n.|订阅|subscribe|同族：scrib / script|Cancel the subscription when it is no longer needed.|不再需要时取消订阅。|The subscription remains active until the connection closes.|连接关闭之前，订阅会一直有效。|event subscription;active subscription
unsubscribe|ˌʌnsəbˈskraɪb|v.|取消订阅|subscribe|+ un-|Unsubscribe from the stream during cleanup.|清理时取消对这个流的订阅。|The client can unsubscribe at any time.|客户端可以随时取消订阅。|unsubscribe from updates;unsubscribe callback
`);
add('compile','构建与交付',`
compile|kəmˈpaɪl|v.|编译|||Compile the source code before running the program.|运行程序之前先编译源代码。|The project does not compile with this configuration.|项目无法使用这套配置编译。|compile source code;compile a program
compiler|kəmˈpaɪlɚ|n.|编译器|compile|+ -er，去 e|The compiler reports a type error.|编译器报告了一个类型错误。|Enable warnings in the compiler settings.|在编译器设置中启用警告。|compiler error;compiler option
compilation|ˌkɑːmpəˈleɪʃən|n.|编译过程|compile|同族对应|Compilation failed because a dependency was missing.|编译因缺少依赖而失败。|Incremental compilation reduces build time.|增量编译可以缩短构建时间。|incremental compilation;compilation error
recompile|ˌriːkəmˈpaɪl|v.|重新编译|compile|+ re-|Recompile the module after changing the interface.|更改接口后重新编译模块。|You do not need to recompile every file.|你不需要重新编译每个文件。|recompile a module;recompile the source
decompile|ˌdiːkəmˈpaɪl|v.|反编译|compile|+ de-|The tool can decompile the bytecode.|这个工具可以反编译字节码。|Decompile the test artifact to inspect the generated logic.|反编译测试产物以检查生成的逻辑。|decompile bytecode;decompile a binary
decompiler|ˌdiːkəmˈpaɪlɚ|n.|反编译器|decompile|+ -er，去 e|The decompiler produces readable source code.|反编译器生成可读的源代码。|A decompiler may not recover the original variable names.|反编译器可能无法恢复原始变量名。|bytecode decompiler;decompiler output
recompilation|ˌriːkɑːmpəˈleɪʃən|n.|重新编译|recompile|同族对应|Changing the header triggers recompilation.|修改头文件会触发重新编译。|The cache avoids unnecessary recompilation.|缓存可以避免不必要的重新编译。|full recompilation;automatic recompilation
`);
add('parse','数据处理',`
parse|pɑːrs|v.|解析|||Parse the JSON response before accessing its properties.|先解析 JSON 响应，再访问其中的属性。|The function parses the command-line arguments.|这个函数解析命令行参数。|parse JSON;parse an expression
parser|ˈpɑːrsɚ|n.|解析器|parse|+ -er，去 e|The parser rejects invalid input.|解析器会拒绝无效输入。|Pass the text to the parser.|将文本传给解析器。|JSON parser;syntax parser
parsing|ˈpɑːrsɪŋ|n.|解析过程|parse|+ -ing，去 e|Parsing stops at the first syntax error.|解析会在第一个语法错误处停止。|The library supports streaming parsing.|这个库支持流式解析。|parsing error;streaming parsing
reparse|ˌriːˈpɑːrs|v.|重新解析|parse|+ re-|Reparse the document after applying the patch.|应用补丁后重新解析文档。|The editor only needs to reparse the changed section.|编辑器只需要重新解析修改过的部分。|reparse a document;reparse the input
parseable|ˈpɑːrsəbəl|adj.|可解析的|parse|+ -able|Return the error in a machine-parseable format.|以机器可解析的格式返回错误。|The output must remain parseable after compression is removed.|解压后输出必须仍然可以被解析。|machine-parseable output;parseable format
`);
add('configure','构建与交付',`
configure|kənˈfɪɡjɚ|v.|配置|||Configure the server to listen on port 8080.|配置服务器，使其监听 8080 端口。|You can configure the timeout in this file.|你可以在这个文件中配置超时时间。|configure a server;configure a timeout
configuration|kənˌfɪɡjəˈreɪʃən|n.|配置|configure|同族对应|Load the configuration before starting the service.|启动服务前先加载配置。|The default configuration works for local development.|默认配置适用于本地开发。|configuration file;default configuration
configurable|kənˈfɪɡjərəbəl|adj.|可配置的|configure|+ -able，去 e|The retry limit is configurable.|重试次数上限是可配置的。|Expose the cache size as a configurable option.|将缓存大小作为可配置选项提供。|configurable option;configurable timeout
reconfigure|ˌriːkənˈfɪɡjɚ|v.|重新配置|configure|+ re-|Reconfigure the service after rotating the certificate.|更换证书后重新配置服务。|The client can reconfigure itself without restarting.|客户端可以在不重启的情况下重新配置自身。|reconfigure a service;reconfigure the client
misconfigure|ˌmɪskənˈfɪɡjɚ|v.|错误配置|configure|+ mis-|It is easy to misconfigure the proxy settings.|代理设置很容易配置出错。|A typo can cause an operator to misconfigure the service.|拼写错误可能导致运维人员错误配置服务。|misconfigure a proxy;misconfigure a service
misconfiguration|ˌmɪskənˌfɪɡjəˈreɪʃən|n.|配置错误|configuration|+ mis-|A misconfiguration caused the connection failure.|配置错误导致了连接失败。|The health check detects common misconfigurations.|健康检查可以检测常见的配置错误。|server misconfiguration;network misconfiguration
`);
add('depend','构建与交付',`
depend|dɪˈpend|v.|依赖|||The result may depend on the operating system.|结果可能取决于操作系统。|This module does not depend on the user interface.|这个模块不依赖用户界面。|depend on;depend on a module
dependent|dɪˈpendənt|adj.|依赖的|depend|同族对应|The output is dependent on the input order.|输出取决于输入顺序。|Restart the dependent services after the database is ready.|数据库就绪后重新启动依赖它的服务。|dependent service;platform-dependent code
dependency|dɪˈpendənsi|n.|依赖项；依赖关系|depend|同族对应|This package has no external dependencies.|这个包没有外部依赖。|Update the dependency to fix the compatibility issue.|更新依赖项以修复兼容性问题。|dependency graph;external dependency
independent|ˌɪndɪˈpendənt|adj.|独立的|dependent|+ in-|Run independent tasks in parallel.|并行运行相互独立的任务。|Keep the tests independent of each other.|让测试彼此独立。|independent task;platform-independent code
independence|ˌɪndɪˈpendəns|n.|独立性|independent|同族：-ent / -ence|This interface provides independence from the storage engine.|这个接口使应用不依赖特定存储引擎。|Test independence improves the reliability of the suite.|测试独立性提高了测试集的可靠性。|platform independence;test independence
interdependent|ˌɪntɚdɪˈpendənt|adj.|相互依赖的|dependent|+ inter-|These services are tightly interdependent.|这些服务紧密地相互依赖。|Avoid deploying interdependent changes separately.|避免将相互依赖的变更分开部署。|interdependent services;interdependent changes
interdependency|ˌɪntɚdɪˈpendənsi|n.|相互依赖关系|dependency|+ inter-|Document the interdependencies between modules.|记录模块之间的相互依赖关系。|The diagram reveals an unexpected interdependency.|这张图揭示了一处意外的相互依赖关系。|module interdependency;service interdependency
`);
add('mutate','语言与结构',`
mutate|ˈmjuːteɪt|v.|改变；修改|||Do not mutate the input array.|不要修改输入数组。|The callback may mutate shared state.|这个回调可能会修改共享状态。|mutate an object;mutate state
mutation|mjuːˈteɪʃən|n.|变更；修改|mutate|同族对应|The mutation updates the user profile.|这个变更操作更新用户资料。|Avoid direct mutation of shared data.|避免直接修改共享数据。|state mutation;data mutation
mutant|ˈmjuːtənt|n.|变异体；变异测试中的改动版本|mutate|同族对应|The test suite failed to detect the mutant.|测试集未能检测出这个变异版本。|A surviving mutant may reveal a gap in the tests.|存活的变异体可能揭示测试中的缺口。|surviving mutant;mutation testing
mutable|ˈmjuːtəbəl|adj.|可变的|mutate|同族对应|A mutable object can change after creation.|可变对象可以在创建后发生变化。|Protect mutable state with a lock.|使用锁保护可变状态。|mutable state;mutable object
immutable|ɪˈmjuːtəbəl|adj.|不可变的|mutable|+ im-（否定）|Strings are immutable in JavaScript.|JavaScript 中的字符串是不可变的。|Return a new object instead of changing the immutable value.|返回一个新对象，而不要改变这个不可变值。|immutable object;immutable data
immutability|ɪˌmjuːtəˈbɪləti|n.|不可变性|immutable|同族：-able / -ability|Immutability makes state changes easier to track.|不可变性让状态变化更容易跟踪。|The type system can enforce immutability.|类型系统可以强制实施不可变性。|data immutability;enforce immutability
`);
add('sync','API 与网络',`
synchronous|ˈsɪŋkrənəs|adj.|同步的|||A synchronous call blocks until it returns.|同步调用会一直阻塞，直到返回。|Use synchronous operations only when the delay is acceptable.|仅在延迟可接受时使用同步操作。|synchronous call;synchronous operation
asynchronous|eɪˈsɪŋkrənəs|adj.|异步的|synchronous|+ a-（否定）|The client uses asynchronous requests.|客户端使用异步请求。|An asynchronous function returns a promise in JavaScript.|在 JavaScript 中，异步函数返回一个 Promise。|asynchronous request;asynchronous function
synchronize|ˈsɪŋkrənaɪz|v.|同步|synchronous|同族对应|Synchronize the local cache with the server.|让本地缓存与服务器同步。|The lock helps synchronize access to shared state.|锁有助于协调对共享状态的访问。|synchronize data;synchronize access
synchronization|ˌsɪŋkrənəˈzeɪʃən|n.|同步；同步过程|synchronize|同族对应|Data synchronization runs in the background.|数据同步在后台运行。|The threads require synchronization to avoid a race condition.|这些线程需要同步，以避免竞态条件。|data synchronization;thread synchronization
async|ˈeɪsɪŋk|adj.|异步的（缩略形式）|asynchronous|缩略形式|Mark the function as async to use await inside it.|将函数标记为 async，以便在其中使用 await。|The async handler returns a promise.|这个异步处理函数返回一个 Promise。|async function;async handler
sync|sɪŋk|n./v.|同步（缩略形式）|synchronize|缩略形式|Sync the settings across your devices.|在你的设备之间同步设置。|The next sync starts in five minutes.|下一次同步将在五分钟后开始。|sync settings;sync status
asynchronously|eɪˈsɪŋkrənəsli|adv.|异步地|asynchronous|+ -ly|Load the image asynchronously.|异步加载图片。|The worker processes messages asynchronously.|这个工作线程异步处理消息。|load asynchronously;execute asynchronously
`);
add('everyday','文档与报错',`
argument|ˈɑːrɡjəmənt|n.|实参；传入的参数|||Pass the file path as the first argument.|将文件路径作为第一个实参传入。|The function accepts an optional argument.|这个函数接收一个可选实参。|function argument;optional argument
parameter|pəˈræmətɚ|n.|参数；形参|||The timeout parameter is measured in milliseconds.|timeout 参数以毫秒为单位。|Give each parameter a descriptive name.|为每个形参起一个描述性名称。|query parameter;function parameter
exception|ɪkˈsepʃən|n.|异常|||Catch the exception at the service boundary.|在服务边界捕获异常。|An unhandled exception terminated the process.|一个未处理的异常终止了进程。|throw an exception;handle an exception
invalid|ɪnˈvælɪd|adj.|无效的|||The server rejected the invalid token.|服务器拒绝了无效令牌。|Return an error for invalid input.|对无效输入返回错误。|invalid input;invalid token
deprecated|ˈdeprəkeɪtɪd|adj.|已不推荐使用的|||This method is deprecated; use the new API instead.|此方法已不推荐使用；请改用新 API。|Replace the deprecated option before upgrading.|升级前替换掉已不推荐使用的选项。|deprecated method;deprecated API
undefined|ˌʌndɪˈfaɪnd|adj.|未定义的|||The variable is undefined at this point.|这个变量在此处尚未定义。|Check for undefined before reading the property.|读取属性之前检查值是否为 undefined。|undefined value;undefined behavior
`);
add('everyday','API 与网络',`
request|rɪˈkwest|n./v.|请求|||Send a request to the API endpoint.|向 API 端点发送请求。|The request failed because the token expired.|请求因令牌过期而失败。|HTTP request;request body
response|rɪˈspɑːns|n.|响应|||The response contains a list of users.|响应包含一个用户列表。|Check the status code before processing the response.|处理响应前先检查状态码。|response body;response header
endpoint|ˈendpɔɪnt|n.|端点；接口地址|||This endpoint returns the current user profile.|这个端点返回当前用户资料。|Protect the endpoint with authentication.|为这个端点启用身份验证。|API endpoint;service endpoint
payload|ˈpeɪloʊd|n.|载荷；有效数据|||The payload must include a user ID.|载荷必须包含用户 ID。|Reject the request if the payload is too large.|如果载荷过大，则拒绝请求。|request payload;JSON payload
timeout|ˈtaɪmaʊt|n.|超时；超时时间|||Increase the timeout for slow connections.|为慢速连接增加超时时间。|A timeout does not always mean the operation failed.|超时并不总意味着操作失败。|connection timeout;request timeout
retry|ˌriːˈtraɪ|v./n.|重试|||Retry the request after a short delay.|短暂延迟后重试请求。|Limit the number of retry attempts.|限制重试次数。|retry a request;retry policy
`);
add('everyday','构建与交付',`
build|bɪld|n./v.|构建；构建产物|||The build failed during type checking.|构建在类型检查阶段失败了。|Build the application before deployment.|部署前先构建应用。|production build;build pipeline
deploy|dɪˈplɔɪ|v.|部署|||Deploy the new version to the staging environment.|将新版本部署到预发布环境。|We deploy small changes frequently.|我们经常部署小范围变更。|deploy a service;deploy to production
release|rɪˈliːs|n./v.|发布；版本|||This release fixes several compatibility issues.|这个版本修复了几个兼容性问题。|Release the lock after updating the shared value.|更新共享值后释放锁。|release notes;release a lock
artifact|ˈɑːrtɪfækt|n.|构建产物|||Upload the build artifact after the tests pass.|测试通过后上传构建产物。|Keep each artifact associated with its commit.|让每个构建产物都关联到对应提交。|build artifact;release artifact
environment|ɪnˈvaɪrənmənt|n.|环境|||Set the environment variable before starting the server.|启动服务器前设置环境变量。|The bug only occurs in the production environment.|这个错误只在生产环境出现。|environment variable;development environment
rollback|ˈroʊlbæk|n.|回滚|||Prepare a rollback plan before deployment.|部署前准备回滚计划。|The rollback restored the previous version.|回滚恢复了之前的版本。|rollback plan;automatic rollback
`);
add('everyday','数据与存储',`
query|ˈkwɪri|n./v.|查询|||The query returns the ten most recent records.|这个查询返回最近的十条记录。|Optimize the query before adding more servers.|增加服务器之前先优化查询。|database query;query parameter
schema|ˈskiːmə|n.|模式；结构定义|||Validate the document against the schema.|根据模式校验文档。|The migration changes the database schema.|这次迁移会改变数据库模式。|database schema;JSON schema
transaction|trænˈzækʃən|n.|事务|||Roll back the transaction if any operation fails.|如果任何操作失败，就回滚该事务。|Commit the transaction after all updates succeed.|所有更新成功后提交事务。|database transaction;commit a transaction
cache|kæʃ|n./v.|缓存|||Store the result in the cache.|将结果存入缓存。|Invalidate the cache when the source data changes.|源数据变化时使缓存失效。|cache hit;invalidate the cache
index|ˈɪndeks|n./v.|索引|||Create an index on the email column.|在 email 列上创建索引。|The array index is out of bounds.|数组索引越界了。|database index;array index
constraint|kənˈstreɪnt|n.|约束|||The value violates a unique constraint.|这个值违反了唯一性约束。|Add a constraint to prevent negative quantities.|添加约束以防止数量为负数。|unique constraint;foreign key constraint
`);
add('everyday','调试与协作',`
debug|ˌdiːˈbʌɡ|v.|调试|||Use a breakpoint to debug the callback.|使用断点调试这个回调。|Debug the issue in a local environment first.|先在本地环境中调试这个问题。|debug a program;debug mode
trace|treɪs|n./v.|跟踪；踪迹|||The stack trace shows where the error occurred.|堆栈跟踪显示了错误发生的位置。|Trace the request across multiple services.|跨多个服务跟踪这个请求。|stack trace;trace a request
assert|əˈsɝːt|v.|断言|||Assert that the result is not empty.|断言结果不为空。|The test asserts that the callback runs once.|这个测试断言回调只运行一次。|assert a condition;assert equality
mock|mɑːk|n./v.|模拟；模拟对象|||Mock the network client in the unit test.|在单元测试中模拟网络客户端。|The mock returns a fixed response.|这个模拟对象返回固定响应。|mock object;mock a dependency
merge|mɝːdʒ|v./n.|合并|||Merge the branch after the checks pass.|检查通过后合并分支。|This function merges two sorted arrays.|这个函数合并两个已排序数组。|merge a branch;merge conflict
conflict|ˈkɑːnflɪkt|n.|冲突|||Resolve the conflict before committing the file.|提交文件前先解决冲突。|The update caused a version conflict.|这次更新导致了版本冲突。|merge conflict;version conflict
review|rɪˈvjuː|n./v.|评审；检查|||Review the changes before merging the branch.|合并分支前评审这些变更。|The code review caught a missing error handler.|代码评审发现缺少一处错误处理。|code review;review a change
approve|əˈpruːv|v.|批准；认可|||Approve the change after verifying the test results.|核实测试结果后批准这项变更。|A maintainer must approve the pull request.|必须由一位维护者批准这个拉取请求。|approve a change;approve a pull request
`);
families.push(
 {id:'execute',label:'execute',meaning:'执行与运行',type:'base',description:'以 execute 为词基，区分“执行”这一动作、执行过程和执行组件。',source:'https://www.etymonline.com/word/execute'},
 {id:'allocate',label:'allocate',meaning:'内存与资源分配',type:'base',description:'以 allocate 为词基，理解内存与资源的分配、释放和重新分配。',source:'https://www.etymonline.com/word/allocate'},
 {id:'serialize',label:'serialize',meaning:'序列化',type:'base',description:'以 serialize 为词基，理解对象与字节序列之间的双向转换。',source:'https://www.etymonline.com/word/serialize'},
 {id:'validate',label:'validate',meaning:'有效性校验',type:'base',description:'以 validate 为词基，区分校验动作、校验结果与校验器。',source:'https://www.etymonline.com/word/validate'},
 {id:'authenticate',label:'authenticate',meaning:'身份认证',type:'base',description:'以 authenticate 为词基，回答“你是谁”的身份认证问题。',source:'https://www.etymonline.com/word/authenticate'},
 {id:'authorize',label:'authorize',meaning:'访问授权',type:'base',description:'以 authorize 为词基，回答“你可以访问什么”的授权问题。',source:'https://www.etymonline.com/word/authorize'},
 {id:'persist',label:'persist',meaning:'持久化',type:'base',description:'以 persist 为词基，理解数据如何在重启后继续存在。',source:'https://www.etymonline.com/word/persist'},
 {id:'iterate',label:'iterate',meaning:'迭代与遍历',type:'base',description:'以 iterate 为词基，理解遍历、迭代器和可迭代对象。',source:'https://www.etymonline.com/word/iterate'},
 {id:'recurse',label:'recurse',meaning:'递归',type:'base',description:'以 recurse 为词基，理解递归的写法、深度与终止条件。',source:'https://www.etymonline.com/word/recurse'},
 {id:'compose',label:'compose',meaning:'组合与分解',type:'base',description:'以 compose 为词基，理解如何组合小单元，以及如何拆分大单元。',source:'https://www.etymonline.com/word/compose'},
 {id:'resolve',label:'resolve',meaning:'解析与解决',type:'base',description:'以 resolve 为词基，区分名称解析、依赖解析与问题解决。',source:'https://www.etymonline.com/word/resolve'},
 {id:'optimize',label:'optimize',meaning:'性能优化',type:'base',description:'以 optimize 为词基，理解优化动作、优化结果与优化器。',source:'https://www.etymonline.com/word/optimize'},
 {id:'compress',label:'compress',meaning:'压缩与解压',type:'base',description:'以 compress 为词基，理解压缩与解压缩这对相反过程。',source:'https://www.etymonline.com/word/compress'},
 {id:'replicate',label:'replicate',meaning:'复制与副本',type:'base',description:'以 replicate 为词基，理解复制、副本同步与只读副本。',source:'https://www.etymonline.com/word/replicate'},
 {id:'distribute',label:'distribute',meaning:'分发与分布式',type:'base',description:'以 distribute 为词基，理解请求分发与分布式系统。',source:'https://www.etymonline.com/word/distribute'},
 {id:'concurrent',label:'concurrent',meaning:'并发',type:'base',description:'以 concurrent 为词基，理解并发这一“时间上重叠”的推进方式。',source:'https://www.etymonline.com/word/concurrent'},
 {id:'parallel',label:'parallel',meaning:'并行',type:'base',description:'以 parallel 为词基，理解同一时刻真正同时执行的含义。',source:'https://www.etymonline.com/word/parallel'},
 {id:'idempotent',label:'idempotent',meaning:'幂等性',type:'base',description:'以 idempotent 为词基，理解重复执行不改变结果的约定。',source:'https://www.etymonline.com/word/idempotent'},
 {id:'atomic',label:'atomic',meaning:'原子性',type:'base',description:'以 atomic 为词基，理解“不可分割”的操作与事务原子性。',source:'https://www.etymonline.com/word/atomic'},
 {id:'encapsulate',label:'encapsulate',meaning:'封装',type:'base',description:'以 encapsulate 为词基，理解把内部细节隐藏起来的设计方式。',source:'https://www.etymonline.com/word/encapsulate'},
 {id:'inherit',label:'inherit',meaning:'继承',type:'base',description:'以 inherit 为词基，理解子类从父类获得字段与方法。',source:'https://www.etymonline.com/word/inherit'},
 {id:'instance',label:'instance',meaning:'实例化',type:'base',description:'以 instance 为词基，区分“实例”与“实例化”这一动作。',source:'https://www.etymonline.com/word/instance'},
 {id:'polymorphism',label:'polymorphism',meaning:'多态',type:'base',description:'以 polymorphism 为词基，理解同一接口对应多种实现。',source:'https://www.etymonline.com/word/polymorphism'},
 {id:'interrupt',label:'interrupt',meaning:'中断',type:'base',description:'以 interrupt 为词基，理解线程中断与过程中断。',source:'https://www.etymonline.com/word/interrupt'},
 {id:'buffer',label:'buffer',meaning:'缓冲',type:'base',description:'以 buffer 为词基，理解缓冲区与缓冲这一过程。',source:'https://www.etymonline.com/word/buffer'}
);
add('execute','语言与结构',`
execute|ˈeksɪkjuːt|v.|执行；运行|||The worker executes each task in a separate process.|工作进程在独立进程中执行每项任务。|The scheduler executes pending jobs every five minutes.|调度器每五分钟执行一次待处理的任务。|execute a command;execute a task|通常指执行程序、命令或任务；这里不收录非技术义项。
execution|ˌeksɪˈkjuːʃən|n.|执行；运行过程|execute|同族对应|Execution stops when an unhandled exception occurs.|发生未处理的异常时，执行会停止。|The profiler samples the call stack during execution.|性能分析器在执行期间对调用栈进行采样。|execution time;execution context|
executable|ɪɡˈzekjətəbəl|n./adj.|可执行文件；可执行的|execute|同族对应|The build produces a standalone executable.|构建会生成一个独立的可执行文件。|Mark the script as executable before running it on the server.|在服务器上运行脚本之前，先将其标记为可执行文件。|executable file;executable code|
executor|ɪɡˈzekjətɚ|n.|执行器；任务执行组件|execute|同族对应|Submit the task to the executor.|将任务提交给执行器。|The executor retries failed jobs twice before giving up.|执行器会在放弃之前对失败的任务重试两次。|task executor;thread pool executor|
`);
add('allocate','语言与结构',`
allocate|ˈæləkeɪt|v.|分配；划拨资源|||Allocate enough memory for the output buffer.|为输出缓冲区分配足够的内存。|The runtime allocates a new frame for every function call.|运行时为每次函数调用分配一个新的栈帧。|allocate memory;allocate resources|
allocation|ˌæləˈkeɪʃən|n.|分配；分配过程|allocate|同族对应|Frequent memory allocation can slow down the application.|频繁分配内存可能使应用变慢。|The profiler shows that allocation happens inside the request handler.|性能分析显示内存分配发生在请求处理函数内部。|memory allocation;resource allocation|
allocator|ˈæləkeɪtɚ|n.|分配器|allocate|同族对应|The custom allocator reuses small memory blocks.|自定义分配器会重复利用小内存块。|Expose the allocator as a parameter so tests can replace it.|将分配器作为参数暴露出来，以便测试中替换它。|memory allocator;custom allocator|
deallocate|diːˈæləkeɪt|v.|释放先前分配的资源|allocate|加前缀 de-|Deallocate the buffer after the operation completes.|操作完成后释放缓冲区。|The framework does not deallocate the connection after a timeout.|框架在超时后不会释放该连接。|deallocate memory;deallocate a buffer|
deallocation|ˌdiːæləˈkeɪʃən|n.|资源释放；解除分配|deallocate|同族对应|Incorrect deallocation can cause a memory error.|错误地释放内存可能导致内存错误。|Track every allocation together with its deallocation to find leaks.|将每次分配与其释放配对跟踪，以发现内存泄漏。|memory deallocation;resource deallocation|
reallocate|ˌriːˈæləkeɪt|v.|重新分配；调整分配|allocate|加前缀 re-|The container may reallocate its storage when it grows.|容器扩容时可能重新分配存储空间。|The array may reallocate its buffer when you append more items.|当你追加更多元素时，数组可能会重新分配其缓冲区。|reallocate memory;reallocate storage|
reallocation|ˌriːæləˈkeɪʃən|n.|重新分配|reallocate|同族对应|Reserve capacity to reduce the number of reallocations.|预留容量以减少重新分配的次数。|Preallocate the slice to avoid repeated reallocation during the loop.|预先分配切片，以避免循环期间反复重新分配。|buffer reallocation;memory reallocation|
`);
add('serialize','数据处理',`
serialize|ˈsɪriəlaɪz|v.|序列化|||Serialize the object before sending it over the network.|通过网络发送对象之前，先将它序列化。|The cache serializes the session data before writing it to disk.|缓存将会话数据序列化后再写入磁盘。|serialize an object;serialize data|
serialization|ˌsɪriələˈzeɪʃən|n.|序列化|serialize|同族对应|Serialization converts the object into a format that can be stored.|序列化将对象转换为可存储的格式。|Change the serialization format only in a major release.|仅在主版本发布时才更改序列化格式。|JSON serialization;serialization format|
serializer|ˈsɪriəlaɪzɚ|n.|序列化器|serialize|加后缀 -er，去末尾 e|The serializer converts dates to ISO strings.|序列化器将日期转换为 ISO 格式的字符串。|Register a custom serializer for the timestamp field.|为时间戳字段注册一个自定义序列化器。|JSON serializer;custom serializer|
serializable|ˈsɪriəlaɪzəbəl|adj.|可序列化的|serialize|加后缀 -able，去末尾 e|Only serializable values can be stored by this API.|这个 API 只能存储可序列化的值。|Keep the settings object serializable so it can be logged safely.|让设置对象保持可序列化，以便安全地记录到日志。|serializable object;serializable value|本条为“可序列化的”。数据库隔离级别 SERIALIZABLE 通常译为“可串行化”，是另一技术义项。
deserialize|ˌdiːˈsɪriəlaɪz|v.|反序列化|serialize|加前缀 de-|Deserialize the response into a typed object.|将响应反序列化为具有明确类型的对象。|Never deserialize untrusted input without validating it first.|在未校验之前，绝不要反序列化不受信任的输入。|deserialize a response;deserialize JSON|
deserialization|ˌdiːsɪriələˈzeɪʃən|n.|反序列化|deserialize|同族对应|Deserialization fails when a required field is missing.|缺少必填字段时，反序列化会失败。|Wrap deserialization in a try block to catch malformed payloads.|将反序列化放在 try 块中，以捕获格式错误的载荷。|deserialization error;safe deserialization|
deserializer|ˌdiːˈsɪriəlaɪzɚ|n.|反序列化器|deserialize|加后缀 -er，去末尾 e|The deserializer rejects unknown type names.|反序列化器会拒绝未知的类型名称。|The strict deserializer fails on unexpected extra fields.|严格的反序列化器遇到意外的多余字段时会报错。|custom deserializer;JSON deserializer|
`);
add('validate','文档与报错',`
validate|ˈvælɪdeɪt|v.|校验；验证有效性|||Validate the input before writing it to the database.|将输入写入数据库之前先进行校验。|The form validates the email field on the client side.|表单在客户端校验电子邮件字段。|validate input;validate a schema|
validation|ˌvælɪˈdeɪʃən|n.|校验；有效性验证|validate|同族对应|Validation failed because the email field was empty.|由于电子邮件字段为空，校验失败。|Skip validation for internal calls to keep the hot path fast.|对内部调用跳过校验，以保持热路径的速度。|input validation;validation error|
validator|ˈvælɪdeɪtɚ|n.|校验器|validate|同族对应|The validator checks both the type and the range.|校验器同时检查类型和取值范围。|Write a reusable validator for the request body.|为请求体编写一个可复用的校验器。|schema validator;custom validator|
valid|ˈvælɪd|adj.|有效的；符合规则的|validate|同族对应|The token is valid for ten minutes.|这个令牌的有效期为十分钟。|The request is valid only if both headers are present.|只有当两个头部都存在时，该请求才是有效的。|valid token;valid input|
validity|vəˈlɪdəti|n.|有效性|valid|同族对应|Check the validity of the certificate before connecting.|连接前检查证书的有效性。|The cache checks the validity of the token on every request.|缓存在每次请求时检查令牌的有效性。|certificate validity;token validity|
`);
add('authenticate','API 与网络',`
authenticate|ɔːˈθentɪkeɪt|v.|认证；验证身份|||Authenticate the user before returning private data.|返回私有数据之前，先验证用户身份。|The gateway authenticates every request before routing it.|网关在转发之前对每个请求进行身份认证。|authenticate a user;authenticate a request|
authentication|ɔːˌθentɪˈkeɪʃən|n.|身份认证|authenticate|同族对应|Authentication failed because the credentials were incorrect.|由于凭据不正确，身份认证失败。|Switch from password authentication to token authentication.|将密码认证改为令牌认证。|multi-factor authentication;authentication token|回答“你是谁”；与决定访问权限的 authorization 区分。
authenticator|ɔːˈθentɪkeɪtɚ|n.|认证器；身份验证组件|authenticate|同族对应|The authenticator verifies the one-time code.|认证器验证一次性验证码。|Configure the authenticator with the shared secret.|使用共享密钥配置认证器。|authenticator app;custom authenticator|
`);
add('authorize','API 与网络',`
authorize|ˈɔːθəraɪz|v.|授权；批准访问|||Authorize the request only if the user has the required role.|仅在用户具有所需角色时，才授权该请求。|The service authorizes each call against the user's role.|服务根据用户角色对每次调用进行授权。|authorize a request;authorize access|
authorization|ˌɔːθərəˈzeɪʃən|n.|授权；权限判定|authorize|同族对应|Authorization determines which resources the user can access.|授权决定用户能够访问哪些资源。|Add an authorization check before deleting the record.|删除记录之前增加一次授权检查。|authorization policy;authorization check|回答“你可以访问什么或执行什么”；与 authentication 区分。
unauthorized|ʌnˈɔːθəraɪzd|adj.|未经授权的|authorize|同族：un- + authorized|Block unauthorized access to the admin interface.|阻止对管理界面的未经授权访问。|The client retries once after receiving an unauthorized response.|客户端在收到未授权响应后重试一次。|unauthorized access;unauthorized request|普通技术形容词表示未经授权；HTTP 401 的协议语义涉及缺少有效认证凭据，不能只按中文词面判断状态码。
`);
add('persist','数据与存储',`
persist|pɚˈsɪst|v.|持久化保存；持续存在|||Persist the settings before closing the application.|关闭应用前将设置持久化保存。|The worker does not persist intermediate results.|该工作进程不会持久化保存中间结果。|persist data;persist changes|
persistence|pɚˈsɪstəns|n.|持久化；持久性|persist|同族对应|The persistence layer stores application data.|持久化层存储应用数据。|Choose the persistence strategy before scaling the service.|在扩展服务之前先确定持久化策略。|persistence layer;data persistence|
persistent|pɚˈsɪstənt|adj.|持久的；持续存在的|persist|同族对应|Use persistent storage for data that must survive a restart.|对于重启后仍需保留的数据，使用持久化存储。|A persistent volume keeps the data across pod restarts.|持久卷可以在 Pod 重启后保留数据。|persistent storage;persistent connection|
`);
add('iterate','数据处理',`
iterate|ˈɪtəreɪt|v.|迭代；遍历|||Iterate over the collection without modifying it.|遍历这个集合，但不要修改它。|Iterate in reverse when you remove items from the list.|当你要从列表中删除元素时，请反向遍历。|iterate over a list;iterate through records|
iteration|ˌɪtəˈreɪʃən|n.|迭代；一轮循环|iterate|同族对应|Each iteration processes one batch of records.|每轮迭代处理一批记录。|Stop the iteration as soon as the target is found.|一旦找到目标就停止本轮迭代。|loop iteration;iteration count|
iterator|ˈɪtəreɪtɚ|n.|迭代器|iterate|同族对应|The iterator returns one item at a time.|迭代器每次返回一个元素。|An exhausted iterator cannot be reused.|已耗尽的迭代器无法重复使用。|iterator protocol;custom iterator|
iterable|ˈɪtərəbəl|n./adj.|可迭代对象；可迭代的|iterate|同族对应|The function accepts any iterable of strings.|这个函数接受任何由字符串组成的可迭代对象。|Convert the iterable into a list before sorting it.|在排序之前先将可迭代对象转换为列表。|iterable object;iterable collection|
`);
add('recurse','数据处理',`
recurse|rɪˈkɝːs|v.|递归执行|||The function recurses into each subdirectory.|这个函数递归进入每个子目录。|Do not recurse deeper than the configured limit.|不要递归超过配置的深度上限。|recurse into a directory;recurse through a tree|
recursion|rɪˈkɝːʒən|n.|递归|recurse|同族对应|Deep recursion can exhaust the call stack.|过深的递归可能耗尽调用栈。|Rewrite the recursion as a loop to avoid stack growth.|将递归改写为循环，以避免调用栈增长。|recursion depth;tail recursion|
recursive|rɪˈkɝːsɪv|adj.|递归的|recurse|同族对应|The recursive function needs a clear base case.|这个递归函数需要一个明确的终止条件。|Test the recursive function with an empty input.|用空输入测试这个递归函数。|recursive function;recursive call|
`);
add('compose','语言与结构',`
compose|kəmˈpoʊz|v.|组合；构成|||Compose small functions to build a larger transformation.|组合小函数以构建更大的转换操作。|Compose the middleware chain from small reusable pieces.|用小的可复用组件组合出中间件链。|compose functions;compose components|
composition|ˌkɑːmpəˈzɪʃən|n.|组合；组合关系|compose|同族对应|Use composition to share behavior between components.|使用组合在组件之间共享行为。|Prefer composition over deep inheritance hierarchies.|优先使用组合，而不是深层继承体系。|function composition;object composition|
composable|kəmˈpoʊzəbəl|adj.|可组合的|compose|加后缀 -able，去末尾 e|Design composable utilities with small interfaces.|设计接口简单、可组合的工具函数。|Split the client into composable parts that can be tested alone.|将客户端拆分为可单独测试的可组合部分。|composable function;composable architecture|
decompose|ˌdiːkəmˈpoʊz|v.|分解；拆分|compose|加前缀 de-|Decompose the large service into smaller modules.|将大型服务拆分成更小的模块。|Decompose the task list into steps with clear inputs and outputs.|将任务列表拆分为输入输出清晰的步骤。|decompose a problem;decompose a service|
`);
add('resolve','数据处理',`
resolve|rɪˈzɑːlv|v.|解析；解决；使 Promise 完成|||Resolve the hostname before opening the connection.|建立连接之前先解析主机名。|The promise never resolves if the callback throws.|如果回调抛出异常，这个 Promise 永远不会完成。|resolve a hostname;resolve a dependency|具体意义取决于对象：hostname 是名称解析，dependency 是依赖解析，conflict 是解决冲突。
resolution|ˌrezəˈluːʃən|n.|解析；解决过程；分辨率|resolve|同族对应|Name resolution failed because the DNS server was unavailable.|由于 DNS 服务器不可用，名称解析失败。|Enable debug logging to inspect dependency resolution.|启用调试日志以检查依赖解析过程。|name resolution;dependency resolution|
resolver|rɪˈzɑːlvɚ|n.|解析器；解析组件|resolve|加后缀 -er，去末尾 e|The resolver maps the hostname to an IP address.|解析器将主机名映射为 IP 地址。|Configure a custom resolver for the internal domain.|为内部域名配置一个自定义解析器。|DNS resolver;dependency resolver|
unresolved|ˌʌnrɪˈzɑːlvd|adj.|未解决的；未解析的|resolve|同族：un- + resolved|The linker reported an unresolved symbol.|链接器报告了一个未解析的符号。|The build fails while an unresolved reference remains.|只要存在未解析的引用，构建就会失败。|unresolved symbol;unresolved dependency|
`);
add('optimize','构建与交付',`
optimize|ˈɑːptɪmaɪz|v.|优化|||Optimize the slow query before increasing server capacity.|增加服务器容量之前，先优化慢查询。|Optimize the query only after measuring its cost.|只有在测量过查询开销之后再进行优化。|optimize a query;optimize performance|
optimization|ˌɑːptɪməˈzeɪʃən|n.|优化|optimize|同族对应|Measure performance before and after the optimization.|测量优化前后的性能。|The optimization cut the response time in half.|这项优化将响应时间缩短了一半。|query optimization;compiler optimization|
optimizer|ˈɑːptɪmaɪzɚ|n.|优化器|optimize|加后缀 -er，去末尾 e|The query optimizer chooses an execution plan.|查询优化器选择一个执行计划。|Disable the optimizer to compare the generated plans.|关闭优化器以便比较生成的执行计划。|query optimizer;cost-based optimizer|
`);
add('compress','数据处理',`
compress|kəmˈpres|v.|压缩|||Compress the response to reduce transfer size.|压缩响应以减小传输大小。|Compress the log files before uploading them.|上传之前先压缩日志文件。|compress data;compress a file|
compression|kəmˈpreʃən|n.|压缩|compress|同族对应|Compression reduces storage requirements for repetitive data.|压缩可以降低重复数据的存储需求。|Enable compression for text responses above one kilobyte.|对超过一千字节的文本响应启用压缩。|lossless compression;compression ratio|
decompress|ˌdiːkəmˈpres|v.|解压缩|compress|加前缀 de-|Decompress the archive before reading its contents.|读取归档内容之前先解压缩。|The client must decompress the body before parsing it.|客户端必须先解压缩响应体，再进行解析。|decompress an archive;decompress data|
decompression|ˌdiːkəmˈpreʃən|n.|解压缩|decompress|同族对应|The download completed, but decompression failed.|下载已完成，但解压缩失败。|Measure the decompression cost on large archives.|测量大型归档文件的解压缩开销。|decompression error;decompression step|
`);
add('replicate','数据与存储',`
replicate|ˈreplɪkeɪt|v.|复制；制作副本|||Replicate the database to another region.|将数据库复制到另一个区域。|The primary node replicates every write to two followers.|主节点将每次写入复制到两个从节点。|replicate data;replicate a database|
replication|ˌreplɪˈkeɪʃən|n.|复制；副本同步|replicate|同族对应|Monitor replication lag between the primary and the replica.|监控主库与副本之间的复制延迟。|Replication protects against a single node failure.|复制可以防御单个节点故障。|database replication;replication lag|
replica|ˈreplɪkə|n.|副本|replicate|同族对应|Send read-only queries to the replica.|将只读查询发送到副本。|Promote the replica when the primary becomes unavailable.|当主库不可用时，提升该副本为主库。|read replica;database replica|副本通常用于复制、读取或可用性；持续同步的副本不能自动替代备份。
`);
add('distribute','API 与网络',`
distribute|dɪˈstrɪbjuːt|v.|分发；分配|||Distribute incoming requests across healthy servers.|将传入请求分配到健康的服务器上。|The scheduler distributes jobs evenly across the workers.|调度器将任务均匀分配到各个工作进程。|distribute requests;distribute workload|
distribution|ˌdɪstrɪˈbjuːʃən|n.|分发；发行版；分布|distribute|同族对应|This Linux distribution includes the required tools.|这个 Linux 发行版包含所需工具。|Check the distribution of response times before tuning.|调整之前先检查响应时间的分布。|Linux distribution;load distribution|
distributed|dɪˈstrɪbjuːtɪd|adj.|分布式的|distribute|过去分词形容词化|A distributed system must handle partial failures.|分布式系统必须处理部分组件失效的情况。|Debugging a distributed system requires correlation IDs.|调试分布式系统需要关联 ID。|distributed system;distributed tracing|过去分词用作形容词，在 distributed system 等技术表达中有独立学习价值。
`);
add('concurrent','语言与结构',`
concurrent|kənˈkɝːənt|adj.|并发的|||Limit the number of concurrent requests.|限制并发请求的数量。|Two concurrent writes to the same key can overwrite each other.|对同一个键的两次并发写入可能相互覆盖。|concurrent request;concurrent access|
concurrency|kənˈkɝːənsi|n.|并发；并发性|concurrent|同族对应|Concurrency does not require simultaneous execution on multiple cores.|并发并不要求在多个核心上同时执行。|Set the concurrency level to match the number of cores.|将并发级别设置为与核心数相匹配。|concurrency control;concurrency limit|多个任务的执行进程在时间上重叠，可能交替推进，不要求同一瞬间在多个核心上执行。
concurrently|kənˈkɝːəntli|adv.|并发地|concurrent|加后缀 -ly|The server handles several connections concurrently.|服务器并发处理多个连接。|The tests run concurrently and finish in one minute.|这些测试并发运行，一分钟内完成。|run concurrently;execute concurrently|
`);
add('parallel','语言与结构',`
parallel|ˈpærəlel|adj.|并行的|||Split the workload into parallel tasks.|将工作负载拆分成可并行执行的任务。|The compiler builds independent modules in parallel.|编译器并行构建相互独立的模块。|parallel execution;parallel processing|
parallelism|ˈpærəlelɪzəm|n.|并行；并行性|parallel|加后缀 -ism|The algorithm exposes enough parallelism to use multiple cores.|这个算法具有足够的并行性，可以利用多个核心。|Increasing parallelism helps only until the disk becomes the bottleneck.|提高并行性只有在磁盘成为瓶颈之前才有帮助。|data parallelism;task parallelism|多个计算在同一时间实际执行；与 concurrency 的侧重点不同。
parallelize|ˈpærəlelaɪz|v.|使并行化|parallel|加后缀 -ize|Parallelize the computation across independent batches.|将计算分配到相互独立的批次中并行执行。|Parallelize the import only if the records are independent.|只有在记录彼此独立时，才将导入过程并行化。|parallelize a loop;parallelize computation|
`);
add('idempotent','API 与网络',`
idempotent|ˌaɪdəmˈpoʊtənt|adj.|幂等的|||Design the operation to be idempotent so retries do not duplicate its effects.|将操作设计为幂等，以免重试重复产生作用。|A GET request should be idempotent by definition.|按照定义，GET 请求应当是幂等的。|idempotent operation;idempotent request|重复执行与执行一次具有相同的预期作用，不要求每次响应内容或状态码完全相同。
idempotency|ˌaɪdəmˈpoʊtənsi|n.|幂等性|idempotent|同族对应|Use an idempotency key to prevent duplicate processing.|使用幂等键防止重复处理。|The API documents idempotency for the payment endpoint.|该 API 为支付端点说明了幂等性。|idempotency key;ensure idempotency|另一常见名词形式是 idempotence；本条优先收录 API 文档中常见的 idempotency。
`);
add('atomic','数据与存储',`
atomic|əˈtɑːmɪk|adj.|原子的；不可分割的|||Use an atomic increment for the shared counter.|对共享计数器使用原子递增操作。|Replace the check and the update with one atomic operation.|将检查与更新替换为一个原子操作。|atomic operation;atomic update|针对具体操作及其契约理解“不可分割”；不能假定任意一行代码都是原子的。
atomicity|ˌætəˈmɪsəti|n.|原子性|atomic|同族对应|Transaction atomicity ensures that all changes are committed or none are.|事务的原子性保证所有变更要么全部提交，要么全部不提交。|Atomicity does not prevent two transactions from conflicting.|原子性并不能防止两个事务发生冲突。|transaction atomicity;guarantee atomicity|事务语境强调全部成功或全部不生效；并发原子操作则需结合其可观察效果理解。
`);
add('encapsulate','语言与结构',`
encapsulate|ɪnˈkæpsəleɪt|v.|封装|||Encapsulate the database access behind an interface.|将数据库访问封装在接口之后。|Encapsulate the retry logic so callers do not repeat it.|封装重试逻辑，避免调用方重复实现。|encapsulate logic;encapsulate data|
encapsulation|ɪnˌkæpsəˈleɪʃən|n.|封装|encapsulate|同族对应|Encapsulation limits direct access to internal state.|封装限制了对内部状态的直接访问。|Changing the internal format does not break encapsulation.|改变内部格式不会破坏封装。|data encapsulation;break encapsulation|
`);
add('inherit','语言与结构',`
inherit|ɪnˈherɪt|v.|继承|||The child class inherits behavior from its parent.|子类从父类继承行为。|Subclasses inherit both fields and methods from the base class.|子类从基类继承字段和方法。|inherit a method;inherit behavior|
inheritance|ɪnˈherɪtəns|n.|继承|inherit|同族对应|Use inheritance when the subtype relationship is meaningful.|当子类型关系有实际意义时使用继承。|Replace inheritance with composition when the hierarchy grows.|当继承层次扩大时，用组合替代继承。|class inheritance;multiple inheritance|
`);
add('instance','语言与结构',`
instance|ˈɪnstəns|n.|实例|||Each instance maintains its own connection state.|每个实例维护自己的连接状态。|Compare the object identity to check whether both variables hold the same instance.|通过比较对象标识来判断两个变量是否指向同一个实例。|class instance;instance method|
instantiate|ɪnˈstænʃieɪt|v.|实例化|instance|同族对应|Instantiate the client once and reuse it.|将客户端实例化一次并重复使用。|Instantiate the service in the test setup, not in each test.|在测试准备阶段实例化服务，而不是在每个测试中实例化。|instantiate a class;instantiate an object|
instantiation|ɪnˌstænʃiˈeɪʃən|n.|实例化|instantiate|同族对应|Lazy instantiation delays object creation until it is needed.|延迟实例化会将对象的创建推迟到需要它时。|Move the instantiation outside the loop to reduce overhead.|将实例化移到循环外，以减少开销。|class instantiation;lazy instantiation|
`);
add('polymorphism','语言与结构',`
polymorphism|ˌpɑːliˈmɔːrfɪzəm|n.|多态|||Polymorphism lets different implementations share an interface.|多态让不同实现共享同一个接口。|Polymorphism keeps the caller independent of the concrete type.|多态让调用方不必依赖具体类型。|runtime polymorphism;subtype polymorphism|
polymorphic|ˌpɑːliˈmɔːrfɪk|adj.|多态的|polymorphism|同族对应|The function accepts a polymorphic object through a common interface.|这个函数通过通用接口接收多态对象。|A polymorphic container can store values of different types.|多态容器可以存储不同类型的值。|polymorphic function;polymorphic behavior|
`);
add('interrupt','语言与结构',`
interrupt|ˌɪntəˈrʌpt|v.|中断；打断|||Interrupt the worker when the task is canceled.|任务取消时中断工作线程。|The signal handler interrupts the blocking read.|信号处理函数中断了这次阻塞读取。|interrupt a thread;interrupt execution|
interruption|ˌɪntəˈrʌpʃən|n.|中断|interrupt|同族对应|Handle interruption by releasing resources and exiting cleanly.|通过释放资源并正常退出，来处理中断。|Save your progress before an unexpected interruption.|在意外中断之前先保存进度。|thread interruption;service interruption|
`);
add('buffer','数据处理',`
buffer|ˈbʌfɚ|n./v.|缓冲区；缓冲|||Read the incoming bytes into a buffer.|将传入的字节读入缓冲区。|Increase the buffer to reduce the number of read calls.|增大缓冲区以减少读取调用的次数。|input buffer;buffer size|
buffering|ˈbʌfərɪŋ|n.|缓冲过程|buffer|加 -ing，名词用法|Buffering reduces the number of small writes to disk.|缓冲可以减少向磁盘进行小量写入的次数。|Disable buffering when you need immediate output.|当需要立即输出时，请关闭缓冲。|output buffering;double buffering|-ing 名词用法，作为独立技术过程收录，不将所有动词屈折形式机械扩充为新词。
`);
add('everyday','加密与密码学',`
encrypt|ɪnˈkrɪpt|v.|加密|||Encrypt sensitive data before storing it.|存储敏感数据之前先进行加密。|The client encrypts the payload with the server's public key.|客户端使用服务器的公钥加密载荷。|encrypt data;encrypt a file|
encryption|ɪnˈkrɪpʃən|n.|加密|encrypt|同族对应|Enable encryption for data stored on disk.|为存储在磁盘上的数据启用加密。|Encryption at rest protects the files even if the disk is stolen.|静态加密在磁盘被盗的情况下仍能保护文件。|data encryption;end-to-end encryption|
decrypt|diːˈkrɪpt|v.|解密|encrypt|技术对比：加密与解密|The service decrypts the message using the correct key.|服务使用正确的密钥解密消息。|Only the holder of the private key can decrypt the token.|只有私钥持有者才能解密该令牌。|decrypt a message;decrypt data|
decryption|diːˈkrɪpʃən|n.|解密|decrypt|同族对应|Decryption fails if the key does not match.|密钥不匹配时，解密会失败。|Store the decryption key outside the application directory.|将解密密钥存放在应用目录之外。|decryption key;decryption failure|
cryptography|krɪpˈtɑːɡrəfi|n.|密码学|encrypt|技术关联：所属领域|The library provides standard cryptography primitives.|这个库提供标准密码学原语。|Never implement your own cryptography in production code.|绝不要在生产代码中自行实现密码学算法。|applied cryptography;public-key cryptography|
cryptographic|ˌkrɪptəˈɡræfɪk|adj.|密码学的|cryptography|同族对应|Use a cryptographic random number generator for security tokens.|使用密码学随机数生成器生成安全令牌。|Verify the cryptographic signature before trusting the payload.|在信任该载荷之前，先验证密码学签名。|cryptographic key;cryptographic hash|
`);
add('everyday','性能指标',`
latency|ˈleɪtənsi|n.|延迟|||Measure the latency from the client to the server.|测量客户端到服务器的延迟。|Adding a region reduced latency for nearby users.|增加一个区域降低了附近用户的延迟。|network latency;tail latency|
throughput|ˈθruːpʊt|n.|吞吐量|||The new pipeline improves throughput without adding workers.|新流水线在不增加工作进程的情况下提高了吞吐量。|Throughput drops when the queue grows faster than the consumers.|当队列增长快于消费者处理速度时，吞吐量会下降。|request throughput;network throughput|
bandwidth|ˈbændwɪdθ|n.|带宽|||Large downloads can consume the available bandwidth.|大型下载可能占用可用带宽。|Compress the responses to save bandwidth on mobile networks.|压缩响应以节省移动网络上的带宽。|network bandwidth;bandwidth limit|
`);
add('everyday','线程协调',`
deadlock|ˈdedlɑːk|n.|死锁|||Acquire locks in a consistent order to reduce the risk of deadlock.|按固定顺序获取锁，以降低死锁风险。|The service froze because two threads entered a deadlock.|服务因为两个线程进入死锁而卡住了。|deadlock detection;avoid deadlock|
mutex|ˈmjuːteks|n.|互斥锁|||Use a mutex to protect the shared counter.|使用互斥锁保护共享计数器。|Hold the mutex only for the shortest possible section.|仅在尽可能短的代码段内持有互斥锁。|acquire a mutex;release a mutex|
semaphore|ˈseməfɔːr|n.|信号量|||Use a semaphore to limit access to a pool of resources.|使用信号量限制对资源池的访问。|The semaphore blocks new workers once the limit is reached.|一旦达到上限，信号量就会阻塞新的工作线程。|counting semaphore;acquire a semaphore|
`);
add('everyday','对象与类型系统',`
override|ˌoʊvɚˈraɪd|v.|重写；覆盖|||Override the method to customize the default behavior.|重写这个方法以自定义默认行为。|The subclass overrides the method to add logging.|子类重写该方法以增加日志。|override a method;override a setting|方法重写通常发生于继承或接口实现语境；不要与改变参数列表的方法重载 overload 混淆。
overload|ˌoʊvɚˈloʊd|v.|重载；使超负荷|||In Java, you can overload a method by changing its parameter list.|在 Java 中，可以通过改变参数列表来重载方法。|The compiler reports an ambiguous call when two overloads match.|当两个重载都匹配时，编译器会报告调用不明确。|overload a method;overload an operator|是否支持方法或运算符重载、如何选择实现，取决于编程语言。
generic|dʒəˈnerɪk|adj.|泛型的；通用的|||The generic function works with several element types.|这个泛型函数适用于多种元素类型。|Keep the generic parameter constrained to printable types.|将泛型参数约束为可打印的类型。|generic type;generic function|
`);
add('everyday','网络通信',`
socket|ˈsɑːkɪt|n.|套接字|||Close the socket when the connection is no longer needed.|不再需要连接时关闭套接字。|The server keeps the socket open until the client disconnects.|服务器会保持套接字打开，直到客户端断开连接。|TCP socket;socket connection|
protocol|ˈproʊtəkɔːl|n.|协议|||Both services must use the same protocol version.|两个服务必须使用相同的协议版本。|The handshake negotiates the protocol before any data is sent.|握手会在发送任何数据之前协商协议。|network protocol;protocol version|
`);
export const findWord=(id:string)=>words.find(w=>w.id===id);
export const topics=Array.from(new Set(words.map(w=>w.topic)));
