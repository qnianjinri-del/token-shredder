# Token Shredder PRD

## 1. 产品定位

Token Shredder 是一个本机运行的 AI token 成本桌面宠物。它接收 Agent、脚本、CLI、SDK 或本地代理产生的 token usage，根据用户配置的价格实时计算成本，并用像素风碎纸机宠物把美元碎成 TOKEN 字母块，让 AI token 消耗变得可见、可爱、可感知。

英文定位：A local desktop pet that shreds your AI token spend in real time.

GitHub 一句话：A tiny desktop pet that shreds your AI token spending in real time.

## 2. 非目标

Token Shredder 不是普通 token calculator、手动成本计算网页、财务级 billing dashboard、云端团队账单系统、真实 provider 官方价格查询器、真实 provider 账单替代品，也不是需要用户每次手动输入 token 用量的玩具。

Token Shredder 是 local-first desktop pet、real-time token usage collector、local AI spending visualizer、developer-friendly usage receiver、cute but actually useful agent cost feedback tool。

## 3. 用户体验

用户打开软件后，桌面只出现一个小巧的像素风碎纸机宠物。宠物窗口透明、无边框、始终置顶、可拖动，不显示 dashboard、不显示设置按钮、不显示复杂数字。用户通过右键中文菜单进入后台或退出。

后台窗口负责中文配置界面、新手接入、本地代理配置、价格配置、实时监控接入说明、本地采集服务状态、当前 session 成本明细、usage 事件日志、清空 session、宠物大小和演示模式。

## 4. 桌面宠物需求

- 像素风、桌面宠物感、可爱、小巧、原创。
- 不使用真实美元图片。
- 不使用真实公司 logo、商标 logo 或 provider 官方图标。
- 美元是原创像素风 TOKEN BILL。
- 美元竖着进入碎纸机，槽口对齐。
- 演示态里一张美元被吃完后，下一张接上。
- TOKEN 字母块像碎片一样从出纸口掉落。
- 字母块不应长期卡住遮挡主体。
- 运行时可以轻微抖动，但不能影响辨识度。

## 5. 动画状态机

状态类型：

```ts
type PetRuntimeState = "demo" | "empty" | "active-real" | "idle-real";
type DemoMode = "auto" | "always" | "off";
```

### demo

没有真实 usage 且演示模式为 `auto`，或演示模式为 `always`。碎纸机持续运行，美元循环进入，TOKEN 持续掉落。后台必须提示“当前动画为演示，不代表真实成本”。

### empty

没有真实 usage 且演示模式为 `off`。宠物静止，不碎美元，不掉 TOKEN。后台显示“等待接入”。

### active-real

刚收到 usage，totalCost 增加。宠物短暂运行，TOKEN 掉落，美元进度推进。跨过整数美元时播放完整吞掉反馈。

### idle-real

已经收到真实 usage，当前没有新 usage。宠物停在当前真实美元进度，不继续碎纸，不继续掉 TOKEN。

默认演示模式为 `off`。首次打开时宠物静止等待真实 usage，避免用户误以为尚未接入时已经产生费用。用户可以在后台手动切换到 `auto` 或 `always` 用于截图、录屏和展示。真实 usage 到来后，默认进入真实监控态，不继续伪造消耗。

## 6. 成本计算

价格配置：

- input price per 1M tokens
- output price per 1M tokens
- cached input price per 1M tokens
- reasoning token price per 1M tokens

usage 事件字段：

- source
- scenarioName
- inputTokens
- outputTokens
- cachedInputTokens
- reasoningTokens
- directCost，可选

公式：

```txt
inputCost = inputTokens / 1_000_000 * inputPricePerMillion
outputCost = outputTokens / 1_000_000 * outputPricePerMillion
cachedCost = cachedInputTokens / 1_000_000 * cachedInputPricePerMillion
reasoningCost = reasoningTokens / 1_000_000 * reasoningPricePerMillion
totalCost = inputCost + outputCost + cachedCost + reasoningCost + directCost
destroyedBills = Math.floor(totalCost)
currentBillProgress = totalCost % 1
```

缺失字段、负数、NaN 按 0 处理。`totalCost = 1.00` 时，`destroyedBills = 1`，`currentBillProgress = 0`。显示层金额统一美元格式，token 数统一千分位显示。

## 7. 价格原则

所有价格都允许用户手动编辑。可以提供示例价格，但必须标注为 editable sample values，不声称官方实时价格，不暗示自动保持最新。

后台文案：这些价格是可编辑示例值，不代表任何 provider 的官方实时价格。请根据你实际使用的模型价格自行填写。

## 8. 本机 Usage Collector

Electron 主进程启动本地 HTTP 服务。默认优先端口为 `17391`，监听 `127.0.0.1`。

v0.1.0 同一个本地服务同时提供三类入口：

1. 新手默认路径：OpenAI-compatible 本机代理 `/v1`。
2. 高级路径：直接上报 usage 的 `/usage`。
3. Codex 本地监控：只读取 `~/.codex/sessions` 中新增的 `token_count` JSONL 行。

### 端口冲突

启动时优先尝试 `17391`。如果端口被占用，尝试 `17392` 到 `17400`。后台显示实际端口，所有复制示例使用实际端口。如果全部不可用，后台显示错误状态，应用不崩溃。

### GET /health

返回服务状态：

```json
{
  "ok": true,
  "app": "Token Shredder",
  "version": "0.1.0",
  "port": 17391,
  "sessionActive": true,
  "receivedUsageEvents": 3,
  "endpoint": "http://127.0.0.1:17391/usage",
  "proxyBaseUrl": "http://127.0.0.1:17391/v1",
  "proxyEnabled": true,
  "codexMonitor": {
    "enabled": true,
    "status": "watching",
    "sessionsPath": "/Users/you/.codex/sessions"
  }
}
```

### POST /v1/chat/completions 等 OpenAI-compatible 路由

新手默认使用本机代理。用户在后台填写：

- API Key
- 上游 Base URL
- 模型 / 接入点 ID
- 四类 token 价格

后台保存并启用后，用户把 AI 客户端的 `baseURL` 改为：

```txt
http://127.0.0.1:<actualPort>/v1
```

v0.1.0 支持基础转发：

- `POST /v1/chat/completions`
- `POST /v1/responses`
- `POST /v1/completions`
- `POST /v1/embeddings`

规则：

- 请求转发到用户配置的上游 Base URL。
- 如果客户端使用占位 Authorization `Bearer token-shredder-local`，主进程使用后台配置的 API Key。
- 如果客户端传入真实 Authorization header，优先透传。
- 非 streaming JSON 响应会尝试提取 `usage` 并驱动宠物。
- streaming 请求优先保证透传，v0.1.0 不保证提取 usage。
- 不记录 prompt、completion、messages、API Key 或 Authorization header。

### POST /usage

自定义格式：

```json
{
  "source": "my-agent",
  "scenarioName": "repo cleanup",
  "inputTokens": 120000,
  "outputTokens": 45000,
  "cachedInputTokens": 30000,
  "reasoningTokens": 8000,
  "directCost": 0
}
```

OpenAI-style usage：

```json
{
  "source": "openai-compatible-client",
  "usage": {
    "prompt_tokens": 120000,
    "completion_tokens": 45000,
    "prompt_tokens_details": {
      "cached_tokens": 30000
    },
    "completion_tokens_details": {
      "reasoning_tokens": 8000
    }
  }
}
```

转换规则：`prompt_tokens` 包含 `cached_tokens` 时，普通 `inputTokens = prompt_tokens - cached_tokens`，避免重复计费。

响应：

```json
{
  "ok": true,
  "accepted": true,
  "eventId": "..."
}
```

### DELETE /usage

清空当前 session，清空累计 tokens、direct cost 和事件计数。宠物根据演示模式回到 `demo` 或 `empty`。

### Codex 本地日志监控

目标：当 Codex Desktop / CLI 在 `~/.codex/sessions` 写入新的 `token_count` 事件时，Token Shredder 自动将其转换为 usage event 并驱动桌面宠物。

规则：

- 默认只监听本机 `~/.codex/sessions`。
- 只解析 `type = "event_msg"` 且 `payload.type = "token_count"` 的 JSONL 行。
- 不读取 prompt、completion、messages、tool output 内容。
- app 启动时跳到现有 session 文件末尾，不回放历史消耗。
- 新增 `last_token_usage` 时，转换为本地 usage event。
- `cached_input_tokens` 从普通 input tokens 中扣除，避免重复计费。
- 如果 Codex 提供 `rate_limits`，后台显示主窗口 / 周窗口 used percent 和 reset 时间。
- 该功能不是官方账单或余额查询，只是本地 token_count 可视化。

## 9. 后台信息架构

后台使用中文，按以下区域组织：

1. 当前状态：本地服务状态、实际服务地址、宠物状态、total burned、destroyed bills、current bill progress、最近 usage。
2. 新手接入：API Key、上游 Base URL、模型 / 接入点 ID、保存并启用、发送测试请求、复制本机 Base URL。
3. Codex 本地监控：watcher 状态、rate limit 百分比、最近 Codex token event。
4. 接入方式：高级 curl、JavaScript fetch、Python requests、OpenAI-style usage、DELETE /usage 示例。
5. 价格配置：editable sample values、preset selector、四类价格输入。
6. Session / 日志：累计 tokens、成本明细、最近 usage 事件，默认只保留最近 100 条。
7. 宠物设置：宠物大小、演示模式。

## 10. Onboarding

v0.1.0 提供首次启动引导卡片。用户尚未完成 onboarding 时，宠物启动后自动打开后台；完成后后续启动只显示桌面宠物，用户可右键进入后台。

1. 说明 Token Shredder 是什么。
2. 明确必要信息：API Key、上游 Base URL、模型 / 接入点 ID、价格。
3. 展示实际端口的本机代理 Base URL。
4. 提供“保存并启用”“发送测试请求”“开始使用”。
5. 提醒价格是可编辑示例值，不代表官方实时价格。
6. onboarding 状态持久化，后台可重新查看接入指南。

## 11. OpenAI-Compatible Proxy

v0.1.0 提供基础本机代理作为新手默认入口，目标是让用户不需要手动计算 token，也不需要自己 POST usage。更完整的 streaming usage extraction、上游配置管理和错误观测放到 v0.2.0。

目标：用户把 OpenAI-compatible client 的 `baseURL` 指向 `http://127.0.0.1:<actualPort>/v1`，Token Shredder 转发请求到真实上游 provider，从响应中提取 usage，驱动桌面宠物。

优先路由：`POST /v1/chat/completions`、`POST /v1/responses`。Streaming 初版必须优先保证透传稳定，不为了统计 usage 破坏流式响应。API Key 默认不记录日志；保存 key 必须由用户明确勾选，并标注本机 localStorage 风险。

## 12. SDK Wrapper 规划

v0.3.0 规划 JS / Python wrapper。wrapper 不代理请求、不保存 API key，只从响应 usage 提取 token 并 POST 到本机 collector。

## 13. CLI Wrapper 规划

后续支持：

```bash
token-shredder run -- your-agent-command
```

捕获 stdout / stderr，从输出或日志中解析 usage，再自动 POST `/usage`。第一版 CLI wrapper 不承诺识别所有工具。

## 14. Agent Log Watcher 规划

后续支持 Codex、Claude Code、Cursor、Continue、Aider 和 custom log file。默认关闭，用户手动开启，用户明确选择日志路径。只解析 usage，不保存 prompt、completion、API key。日志格式变化时优雅失败。

## 15. 多 Session / Project Mode 规划

v0.1.0 只做 current session + 最近事件。后续增加 Project、Session、Source、Workflow 维度。

建议模型：Project、Session、UsageEvent。UsageEvent 包含 source、scenarioName、四类 tokens、directCost、timestamp。

## 16. 隐私和安全

默认原则：

- Local-first。
- 数据留在本机。
- collector 监听 `127.0.0.1`。
- 默认只记录 token 数字、source、scenarioName、timestamp、本地成本估算。
- 默认不记录 prompt、completion、messages。
- 默认不记录 API Key 或 Authorization header。
- Codex watcher 只读取 token_count 行，不保存 Codex prompt/completion/tool output。
- 不上传任何数据到云端。
- 不使用第三方 analytics。
- 本机代理只监听 `127.0.0.1`。
- 保存 API Key 必须由用户明确勾选，并提示当前使用本机 localStorage。

## 17. 发布路线图

### P0 / v0.1.0

- 完整 PRD 和开源 README。
- 桌面宠物保持 Electron 形态。
- 本机 usage collector。
- 基础 OpenAI-compatible 本机代理。
- Codex 本地 token_count watcher。
- 演示态 / 真实监控态 / 空闲态 UI 清晰。
- 演示模式：自动、永远演示、关闭演示。
- 端口冲突处理。
- 首次启动引导卡片。
- usageNormalizer / portManager / cost 测试。
- macOS unsigned `.dmg` / `.zip` 打包脚本和发布文档。
- `npm test`、`npm run lint`、`npm run build` 通过。

### P1 / v0.1.x

- macOS menu bar / tray。
- Signed and notarized macOS builds。
- 更好的截图 / GIF / 发布页。
- JSON import / export。
- 更清晰 session summary。

### P2 / v0.2.0

- 更完整的 OpenAI-compatible local proxy。
- streaming usage extraction。
- proxy event log。
- 更完善的 proxy 错误状态。

### P3 / v0.3.0

- JS SDK wrapper。
- Python SDK wrapper。
- CLI wrapper。
- custom parser。
- multi-session / project mode。

## 18. 验收标准

- 项目仍然是 Electron 桌面宠物应用。
- 桌面只显示宠物，不显示复杂 dashboard。
- 右键菜单可用。
- 后台中文可用。
- `GET /health`、`POST /usage`、`DELETE /usage` 可用。
- 基础 `/v1/chat/completions` 本机代理可用。
- Codex 新 token_count 可以驱动宠物碎钞。
- 自定义 usage 和 OpenAI-style usage 可用。
- cached tokens 不重复计费。
- 价格可编辑且明确为 sample values。
- session 可清空，usage 日志可查看。
- 演示态 / 真实监控态 / 空闲态 UI 清楚。
- 真实 usage 静止时，宠物停在当前美元进度，不继续吐 TOKEN。
- 新 usage 到来时，宠物短暂运行并掉 TOKEN。
- 端口冲突不会导致应用崩溃。
- 后台示例使用实际端口。
- README 是开源发布级别。
- `release:check` 和 macOS 打包脚本可用。
- `npm test`、`npm run lint`、`npm run build` 通过。
