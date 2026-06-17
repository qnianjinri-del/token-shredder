# Roadmap / 路线图

Token Shredder 的目标是做成一个好玩但真的有用的 AI token 成本桌面宠物。

## Now

- 中文优先 README 和落地页。
- 本机 collector：`GET /health`、`POST /usage`、`DELETE /usage`。
- OpenAI-style usage 支持。
- OpenAI-compatible 本机代理基础支持。
- Codex 本地 `token_count` 监控。
- 一键试玩。
- 后台第一屏“从这里开始”三路径新手引导。
- 30 秒验证面板。
- curl / JS / Python / OpenAI SDK / Agent 接入说明一键复制。
- 新手任务清单。
- 配置备份 / 恢复，不导出 API Key 或 session 日志。
- 可复制诊断信息，方便 issue 排查。
- Session 导出 JSON / CSV / Markdown。
- 接入配方中心：curl、JS、Python、OpenAI SDK、Agent instruction。
- GitHub Release 上传脚本。
- 自动 desktop smoke test，减少人工验收成本。
- 打包后 `.app` smoke test。
- GitHub Release 下载资产自动校验。
- 一键 macOS 发版流水线。
- Release SHA256 manifest。
- 6 个内置像素宠物皮肤。
- 分享摘要、分享链接、PNG 卡片、中英文传播帖。
- macOS unsigned `.dmg` / `.zip`。

## Next

- 后台首页任务清单。
- 更好的 provider setup 错误提示。
- 更好的 demo GIF 和真实截图。
- macOS x64 / universal build。
- Homebrew cask 规划。
- 更多原创皮肤。
- 更清晰的 session summary。

## Later

- 完整 streaming usage extraction。
- JS SDK wrapper。
- Python SDK wrapper。
- CLI wrapper。
- 更多 Agent log watcher。
- 多 session / project mode。
- 系统 Keychain 保存密钥。
- signed / notarized macOS build。
- Windows / Linux 桌面体验。

## 不做什么

- 不做云端账号系统。
- 不做第三方 analytics。
- 不做 provider 官方账单替代品。
- 不默认记录 prompt / completion。
- 不默认上传 usage 数据。
