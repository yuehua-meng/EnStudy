# 第三方组件与语音来源

根目录 MIT 许可证适用于 EnStudy 的原创源码和学习内容，不替代第三方许可证。
依赖包版本记录在 `web/package-lock.json` 和 `deploy/piper/requirements.txt`。

## 随仓库保留的第三方源码

- shadcn 相关 UI 与样式使用 MIT 许可证。样式许可原文保留在
  `web/vendor/shadcn-tailwind-4.13.0.LICENSE.md`。
- Sites 构建插件使用 MIT 许可证。原文保留在
  `web/build/sites-vite-plugin.LICENSE`。
- React、Vite、Tailwind CSS、Lucide 和其他 npm 依赖按各自许可证使用。
  仓库不包含 `node_modules`，安装后可在对应包中查看许可原文。

## Piper 与 MP3

- **引擎**：[OHF-Voice/piper1-gpl](https://github.com/OHF-Voice/piper1-gpl)，GPL-3.0。
  它作为可选、独立的离线音频生成工具使用，不包含在网页 JavaScript、仓库或静态发布包中。
  若自行分发引擎或修改后的引擎，须遵循其许可证。
- **音色**：`en_US-ljspeech-high`，美式英语单人女声，22,050 Hz。
  [模型卡](https://huggingface.co/rhasspy/piper-voices/blob/main/en/en_US/ljspeech/high/MODEL_CARD)
  和 [模型仓库](https://huggingface.co/rhasspy/piper-voices) 提供具体来源。
  本仓库不分发模型权重。
- **训练数据**：[LJ Speech Dataset](https://keithito.com/LJ-Speech-Dataset/)，
  上述模型卡注明数据集为 public domain。
- **编码**：lameenc 生成单声道 64 kbps MP3，依赖自身许可证不被本项目 MIT 许可替代。
- **音频内容**：来自本项目的英语词条、技术例句与原创学习短文。
  700 个生成的 MP3 随仓库提供，网页仅在用户点击朗读时加载对应文件。

音频来源也记录在 `web/public/audio-source.txt`，静态部署后可公开查阅。
新增音色前应先核对该音色模型及训练数据的许可，不应把本音色的说明推广到所有 Piper 模型。

## 学习资料链接

短文和补充词库引用官方技术文档作为延伸阅读。链接指向的文档保留其原有版权与许可，
不属于 EnStudy 的 MIT 授权范围。项目文章为原创学习材料，不是官方文档全文副本。
