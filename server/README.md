# 可选账户与云同步

新账户使用「国际手机号＋密码」。可以选择国家／地区填写本地号码，或直接输入带 `+` 区号的国际号码；兼容空格、括号、横线及 `00` 国际前缀。按各国号码长度做宽松格式校验，不严格限制运营商号段或号码类型，也不验证号码是否存在或归用户所有；目前不发送短信。游客继续使用 IndexedDB；登录后同步收藏、复习计划、回答历史和已探索词条。短文循环播放的当前遍数属于本次播放任务，不跨设备续播。语速等界面偏好仍保存在本机。

## 本地运行

```sh
python -m venv .venv
# Linux/macOS: .venv/bin/python；Windows: .venv\Scripts\python.exe
.venv/bin/python -m pip install -r server/requirements.txt
.venv/bin/python server/dev.py
```

另一个终端在 `web` 目录运行 `npm run dev:static`，打开 `http://127.0.0.1:5174/`。Vite 将 `/api` 代理到 `127.0.0.1:8090`。开发数据库、自动生成的开发密钥在 `server/data/`，已被 Git 忽略。不要把开发服务绑定公网。

## 线上部署

生产账户**要求 HTTPS**。HTTP 下仍能学习和循环播放，但登录按钮打开后会提示先启用 HTTPS，前端不会提交密码；后端也拒绝用公网 HTTP origin 启动。部署前准备浏览器信任的证书及固定 HTTPS 访问地址，不能用关闭 Secure Cookie 的方式绕过。

1. 将 `server/.env.example` 复制为 `server/.env`，只在服务器填写配置并设置文件权限为 `600`。
2. `ENSTUDY_ORIGIN` 只填协议与主机，例如 `https://study.example.com`，不包含 `/enstudy/`。生成至少 32 位随机 `ENSTUDY_SECRET`；它用于会话与限流摘要，重启时必须保留。更换会使已有会话失效。
3. 在仓库根目录运行 `docker compose -f deploy/compose.accounts.yml up -d --build`。数据库使用独立命名卷，升级前使用 SQLite backup API 做离机备份；不要仅复制运行中的 `.sqlite3` 主文件，也不要运行 `down -v` 删除数据卷。
4. 在现有**边缘** Caddy 站点块增加下面的 API 路由，并保留原静态路由。API 匹配须先于 `/enstudy/*`；不要覆盖其他项目的配置。

```caddyfile
study.example.com {
    redir /enstudy /enstudy/ 308
    handle /enstudy/api/* {
        uri strip_prefix /enstudy
        reverse_proxy 127.0.0.1:8090 {
            header_up X-Real-IP {remote_host}
        }
    }
    handle_path /enstudy/* {
        reverse_proxy 127.0.0.1:8080
    }
}
```

以上适用于主机上的 Caddy。若边缘 Caddy 在 Docker 内，将 API 服务接入边缘代理网络，删除 `ports`，目标用 `enstudy-api:8090`；静态服务目标沿用现有配置。不要在容器内把 `127.0.0.1` 当作宿主机。边缘代理必须覆盖 `X-Real-IP`，后端不得被公网直接访问；已有 CDN 时，先配置可信代理地址，不能信任客户端随意提供的转发头。

本站默认 `/enstudy/` 子路径，Cookie Path 为 `/enstudy/api`；若部署到域名根目录，改成 `/api` 并调整路由。静态构建方式不变，数据 API 独立，原静态安装器不负责启动账户服务。

启用 HTTPS 后浏览器本地存储与原 HTTP 地址隔离。原有用户应先在 HTTP 站点导出学习备份，再在 HTTPS 站点导入并勾选合并游客记录；账户尚未建立时无法自动跨协议迁移。

## 同步与数据隔离

- 首次注册成功后直接登录；另一个设备输入相同手机号、密码即可获取云端记录。
- 修改后约 1 秒同步；前台每 30 秒检查一次，回到页面、网络恢复时重试。失败会保留本机数据并显示状态。
- 游客存储继续沿用旧版 `main`；每个账户使用独立本地缓存。登录时可明确勾选导入游客记录，默认不导入；退出后恢复游客数据。
- 同一个词的收藏/复习状态以更新时间较新者为准，浏览动作仅更新访问时间。取消收藏和移出复习也保留状态用于同步；复习历史按事件 ID 去重。
- 两个设备同时修改**同一个词**时以较新修改为准，不保证逐字段合并。设备时钟需准确。
- 接口从会话确定用户，不接受客户端指定数据归属。标签页账户切换时校验预期账户 ID，防止旧标签页把记录写入新账户。
- 离线刷新时可能恢复游客模式；重新联网登录原账户后，会读取该账户缓存并同步未上传记录。退出登录保留账户本地缓存，因此共享电脑建议使用独立浏览器用户或清理站点数据。

## 小型站点的安全与容量边界

- 密码 10–128 位，Argon2id 独立随机盐，64 MiB 内存、3 次迭代、1 路并行；无明文密码入库，无默认密码。
- 登录随机会话保存在 HttpOnly / Secure / SameSite=Lax Cookie，服务端只存摘要，7 天有效；退出立即吊销当前会话，每账户最多 10 个有效会话。
- 写请求严格检查 Origin 并要求 JSON，不开放跨域；2 MB 请求限制、数据字段及数量验证、参数化 SQL。
- 登录：每 IP 15 分钟 30 次、每账户 15 分钟 10 次（同一号码不同写法共用计数，成功清除账户计数）；密码哈希操作全站每分钟 60 次。注册每 IP 每小时 5 次、全站每日 50 次，默认最多 1000 个账户。限流计数存 SQLite，服务重启不会清空。
- API 每 IP 每分钟 180 次，同步每账户每分钟 60 次。注册量和防刷阈值是小站初始设置，可能拒绝同一出口下的密集正常请求；应按使用情况调整。
- 独立 SQLite WAL 数据库，无需部署 Redis 或额外数据库；API 容器上限 384 MB、1.5 CPU、两个同步 worker，适合当前小服务器起步。容量仍需实测，不承诺高并发。
- 当前没有验证码，也没有邮箱/短信找回、修改密码或账户删除页面。请使用密码管理器保存凭据；进一步开放推广前，应补充恢复与账户管理流程。限流能降低暴力尝试，不能阻止所有分布式攻击。

## 测试

```sh
python -m unittest discover -s server -p 'test_*.py' -v
cd web
node --test scripts/test-learning.mjs
npx tsc --noEmit
npm run build:static
```

测试使用临时数据库和模拟音频，不发送短信、不修改线上数据。覆盖跨设备合并、账户隔离、失效会话、CSRF、限流，以及整篇精确循环 1000 遍。

参考：[Flask 安全配置](https://flask.palletsprojects.com/en/stable/web-security/)、[Argon2 API](https://argon2-cffi.readthedocs.io/en/stable/api.html)、[OWASP 身份验证建议](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)。

## 国际手机号与旧账户兼容

- 前端使用 libphonenumber-js，后端使用 phonenumbers；采用 possible-length 校验，并共享一组多国测试用例，避免严格运营商规则阻止新号段。统一以 E.164 格式保存，例如 `+12025550123`。不支持分机号、短码或非地理服务号码。
- 新注册接口拒绝普通用户名。`username` API 字段及数据库列名暂时保留，内容为规范化的国际号码，避免破坏已有客户端。原账户 ID、学习记录和有效会话不更改。
- 原来的用户名账户可从“旧账号登录”进入；已有中国大陆裸手机号用户名也能用 `+86` 格式登录，并阻止同号码重新注册。不会自动为旧用户名填写手机号。
- 目前只校验格式，没有验证手机号归属。后续接入短信、手机号找回或绑定功能时，需要新增独立验证步骤和验证状态，不能把当前注册号码当作已验证号码。
- 手机号属于账户信息，界面显示时隐藏中间数字。数据库与备份需要保护，不能提交至 GitHub；示例号码只用于独立测试数据库，不发短信。
