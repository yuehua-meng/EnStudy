# EnStudy 部署与语音生成

本项目可以部署到支持静态文件的网站服务器，包括腾讯云、其他云服务器和本地电脑。
下面使用通用路径 `/opt/enstudy`，不包含任何实际服务器信息。

## 静态构建

```sh
cd web
npm ci
npm run build:static
```

发布目录为 `web/dist-static/`，包含全部页面资源与 700 个预生成 MP3。
只发布此目录，不要上传开发工具、环境配置或浏览器学习备份。
在项目根目录打包（需要系统 tar）：

```sh
tar -czf enstudy-release.tar.gz -C web/dist-static .
```

## 独立 Caddy 容器

服务器需安装 Docker 和 Python 3.12 或更新版本。通过自己配置的 SSH 连接上传发布包、
`deploy/install_site.py` 和 `deploy/Caddyfile`，确保两个文件在同一目录，然后执行：

```sh
python3 install_site.py --base /opt/enstudy --archive enstudy-release.tar.gz
```

默认容器名是 `enstudy-web`，只向主机回环地址发布 `127.0.0.1:8080`。
目录结构为 `releases/<时间戳>/` 和指向当前版本的 `current` 符号链接。
安装器先检查页面和音频，再切换版本；容器操作失败时恢复原来的链接。
它不修改其他应用的反向代理或认证规则。不要同时运行两个安装任务。

如果边缘代理也运行在 Docker 中，可通过 `--network YOUR_NETWORK` 加入已有网络。
此时不向主机发布端口，代理通过 `enstudy-web:8080` 访问。
其他可配置项见 `python3 install_site.py --help`。

## 对接现有反向代理

下面是主机 Caddy 的路径示例，域名需替换为你拥有的域名。域名、证书、DNS 和云防火墙
需自行配置；中国大陆服务器的域名访问需按服务商要求完成备案。

```caddyfile
study.example.com {
    redir /enstudy /enstudy/ 308
    handle_path /enstudy/* {
        reverse_proxy 127.0.0.1:8080
    }
}
```

Docker 网络内的代理应将目标改为 `enstudy-web:8080`。
构建采用相对资源路径，支持站点根目录或 `/enstudy/` 子路径部署。
音频服务支持 Range 请求和长期缓存；页面入口不长期缓存。

## 更新与回退

重新构建、打包并运行安装器即可生成新版本，旧版本保留。
若需回退，把 `current` 链接原子切换到确认存在的旧版本；保持 Caddy 挂载部署根目录，
不要直接挂载 `current` 指向的某个版本。安装器失败后遗留的候选目录可在核查后清理。

学习数据位于浏览器 IndexedDB。HTTP 改 HTTPS、更换域名或浏览器时不会自动迁移，
请先在设置中导出学习备份，再在新地址导入。

## Piper 音频更新

现有音频可直接使用，无需安装语音引擎。修改词库或短文后，再执行：

```sh
cd web
node scripts/sync-reading-articles.mjs
npm run audio:prepare
cd ..
python3 -m venv .venv
.venv/bin/python -m pip install -r deploy/piper/requirements.txt
.venv/bin/python deploy/piper/generate_audio.py
.venv/bin/python deploy/piper/validate_audio.py
```

Windows 对应的 Python 路径为 `.venv\Scripts\python.exe`。
生成器从官方仓库下载 `en_US-ljspeech-high` 模型并校验 SHA-256，使用两条 CPU 线程
生成单声道 MP3；下载和生成耗时取决于网络、硬件。需要使用可信镜像时可设置
`PIPER_MODEL_BASE`，模型校验仍必须通过。

将 `deploy/piper/audio/` 中的 MP3 复制到 `web/public/audio/` 后重新构建。
文件名由音色和原文摘要决定，同一文本复用同一文件，已有文件不会重复生成。
默认不向 Git 提交模型权重、生成报告或虚拟环境；网站仅播放音频，不运行 Piper。
更换模型时需要同步修改清单生成器、下载路径和模型校验值。

语音引擎、音色和数据集来源见根目录 `THIRD_PARTY_NOTICES.md`。

## 可选 SSH 工具

推荐使用系统 SSH/SCP 或自己已有的部署工具。仓库保留 `remote_admin.py` 作为可选
JSON 命令工具，依赖 `paramiko`，通过隐藏输入读取密码。主机和用户必须显式提供：

```sh
python3 -m pip install paramiko
python3 deploy/remote_admin.py --host YOUR_SERVER --user YOUR_USER
```

先通过正常 SSH 连接核对主机指纹并保存到 `known_hosts`。工具拒绝未知主机密钥，
不把密码写入文件；不要在命令参数或仓库中保存密码、Token 和私钥。
