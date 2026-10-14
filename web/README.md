# EnStudy 前端

完整介绍和许可证见 [项目 README](../README.md)。

```sh
npm ci
npm run dev:static
```

打开 `http://127.0.0.1:5174/`。

```sh
npx tsc --noEmit
npm run build:static
npm run preview:static
```

发布目录为 `dist-static/`，包含预生成 MP3。支持根路径与子路径静态部署。
部署及生成音频的说明见 [deploy/README.md](../deploy/README.md)。

原有 Vinext/Sites 开发与构建工具保留在 `scripts/`、`build/` 与 `vite.config.ts`。
`npm run dev` 启动 Vinext 开发服务，默认端口 5173；`npm run build` 构建对应 Worker。
普通静态部署使用 `dev:static` / `build:static`，不需要 Sites 账号或 Cloudflare 绑定。
`.openai/hosting.json` 只包含空的可选绑定；连接自己的托管项目时由自己的工具配置。
