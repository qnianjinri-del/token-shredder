# Token Shredder 新手上手指南

这份文档只回答一个问题：第一次拿到 Token Shredder，应该怎么真正用起来？

Token Shredder 是本机运行的 AI token 成本桌面宠物。它不会自动知道你的所有 AI 花费，你需要选择一种接入方式，让 Agent、脚本、SDK 或本机代理把 usage 数字送到它这里。

## 你先需要知道的三件事

1. 桌面上只显示宠物，设置都在后台。
2. Token Shredder 默认只需要 token usage 数字，不需要 prompt、completion、messages 或 API key。
3. 价格是你自己填写的估算值，不是官方实时价格。

## 第一次打开

1. 打开 `Token Shredder.app`。
2. 桌面会出现一个小像素宠物。
3. 右键宠物，点击 `进入后台`。
4. 后台默认在 `开始` 分区。
5. 先看最上方的 `新手向导`，选择与你最像的一条路。

如果你只是想确认它能动，点击 `一键试玩`。这不会请求任何模型，也不代表真实账单。

## 选择一种使用方式

后台 `新手向导` 会给你四条路：

| 你的情况 | 先点什么 | 必要信息 |
| --- | --- | --- |
| 只想先看效果 | `一键试玩` | 不需要 API Key |
| 有服务商 API Key | `填写 API Key 等信息` | API Key、上游 Base URL、模型 / 接入点 ID、价格 |
| 项目已经能拿到 usage | `复制 POST 示例` | input / output / cached / reasoning token 数字 |
| 想看 Codex 消耗 | `查看 Codex 监控` | 本机 Codex 新产生的 `token_count` 事件 |

不确定选哪个时，先选 `先看效果`。确认宠物能动以后，再接真实 usage。

## 接入方式说明

### 方式 A：我的程序已经能拿到 token 数

这是最简单、最稳的方式。

把你的脚本、Agent 或 CLI 在每次任务结束后拿到的 usage 发到：

```txt
http://127.0.0.1:17391/usage
```

如果端口被占用，后台会显示实际端口。

示例：

```bash
curl -X POST http://127.0.0.1:17391/usage \
  -H "Content-Type: application/json" \
  -d '{"source":"my-agent","scenarioName":"repo cleanup","inputTokens":120000,"outputTokens":45000,"cachedInputTokens":30000,"reasoningTokens":8000}'
```

适合：

- 自己写的 Node.js / Python 脚本。
- 已经能拿到 usage 的 Agent。
- 不想把 API Key 填到 Token Shredder 的用户。

### 方式 B：我用的是 OpenAI-compatible SDK

如果你的客户端支持 `baseURL`，可以走本机代理。

你需要准备：

1. 上游 provider 的 API Key。
2. 上游 Base URL。
3. 模型 / deployment / endpoint ID。
4. input / output / cached input / reasoning 的价格。

然后把客户端 baseURL 改成后台显示的：

```txt
http://127.0.0.1:17391/v1
```

如果上游响应里带 usage，Token Shredder 会提取 usage 并驱动桌面宠物。

### 方式 C：我不知道怎么改项目

进入后台 `接入` 分区，点击：

```txt
复制给 Codex/ChatGPT
```

把复制出来的提示词发给你的 coding agent，让它帮你在当前项目里：

- 提取模型响应 usage。
- POST 到 Token Shredder。
- 避免重复计算 cached tokens。
- 不记录 prompt、completion、messages 或 API key。

## 如何判断成功

成功时你会看到：

- 后台 usage 事件数量增加。
- `Session / 日志` 里出现新的事件。
- 桌面宠物短暂运行。
- 如果费用没有继续增加，宠物会停在当前美元进度，不会继续假装碎钱。

你也可以运行：

```bash
curl http://127.0.0.1:17391/health
```

返回 `ok: true` 说明本地 collector 正在运行。

## 如果失败，先看这里

### 后台是空白

先退出 App，再重新打开。如果仍然空白，请复制诊断信息提交 issue。

### POST /usage 没反应

检查：

- 端口是不是后台实际显示的端口。
- JSON 是否是合法格式。
- 数字字段是否为数字。
- App 是否仍在运行。

### 本机代理测试失败

检查：

- API Key 是否正确。
- 上游 Base URL 是否正确。
- 模型 / endpoint ID 是否正确。
- provider 是否真的兼容 OpenAI SDK。
- 上游响应是否包含 usage。

### 费用不对

检查：

- 价格是否按每 1M tokens 填写。
- cached tokens 是否应该使用 cached input price。
- reasoning tokens 是否有单独价格。
- Token Shredder 是本地估算工具，不是 provider 官方账单。

## 隐私边界

Token Shredder 默认：

- 监听 `127.0.0.1`。
- 只记录 usage 数字、source、scenario、时间戳和本地估算成本。
- 不记录 prompt。
- 不记录 completion。
- 不记录 messages。
- 不上传数据。
- 不使用第三方 analytics。
- 不把 API key 写入 usage 日志。

## 最短验证流程

```bash
curl http://127.0.0.1:17391/health

curl -X POST http://127.0.0.1:17391/usage \
  -H "Content-Type: application/json" \
  -d '{"source":"hello","inputTokens":100000,"outputTokens":50000}'
```

然后看桌面宠物是否碎一次钱。
