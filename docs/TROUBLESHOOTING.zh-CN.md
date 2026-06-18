# Token Shredder 排障指南

这份文档帮你判断：为什么宠物没有因为真实 usage 动起来？

先记住一个原则：Token Shredder 默认只需要 usage 数字。不要为了排障把 API Key、prompt、completion、messages 或 Authorization header 发到 issue。

## 先跑自动体检

1. 打开 App。
2. 右键宠物，点击 `进入后台`。
3. 进入 `开始` 分区。
4. 点击 `运行自动体检`。
5. 按体检卡片里的 `下一步建议` 做。

自动体检报告不会包含 API Key、prompt、completion 或 messages。

## 本地服务不可用

表现：

- `GET /health` 失败。
- 后台显示本地服务未运行。
- `POST /usage` 没反应。

处理：

1. 退出 Token Shredder 后重新打开。
2. 检查端口 `17391-17400` 是否都被占用。
3. 后台会显示实际端口，请不要固定写死 `17391`。
4. 如果仍失败，复制自动体检报告到 issue。

## POST /usage 没有让宠物动

检查：

1. 你是不是发到了后台显示的实际端口。
2. JSON 是否合法。
3. `inputTokens`、`outputTokens`、`cachedInputTokens`、`reasoningTokens` 是否是数字。
4. 是否所有 token 和 directCost 都是 0。
5. App 是否还在运行。

最小验证：

```bash
curl -X POST http://127.0.0.1:17391/usage \
  -H "Content-Type: application/json" \
  -d '{"source":"troubleshooting","inputTokens":100000,"outputTokens":50000}'
```

## 本机代理测试失败

进入后台 `接入` 分区，点击 `发送测试请求`。失败后后台会显示排查卡片，并提供 `复制报告`。

### API Key 或权限问题

常见信号：

- HTTP `401`
- HTTP `403`
- `Unauthorized`
- `Forbidden`
- `API key`
- `鉴权`
- `权限`

处理：

1. 确认 API Key 没有多余空格。
2. 确认 Key 属于当前 provider、region、project。
3. 确认账号有调用该模型的权限。
4. 不要把真实 API Key 贴到 issue。

### 模型 ID、接入点或路径问题

常见信号：

- HTTP `404`
- `model not found`
- `endpoint not found`
- `deployment`
- `模型不存在`
- `接入点不存在`

处理：

1. 确认上游 Base URL 是否正确。
2. 确认 Base URL 是否需要 `/v1` 或 `/compatible-mode/v1`。
3. 确认模型 / 接入点 ID 与控制台完全一致。
4. 如果 provider 使用 deployment，请按它的 OpenAI-compatible 文档填写。

### 限流或额度问题

常见信号：

- HTTP `429`
- `rate limit`
- `quota`
- `too many requests`
- `额度`
- `限流`

处理：

1. 等一会再测试。
2. 检查余额、quota、rate limit。
3. 降低测试频率。
4. 换更低成本模型测试。

### 请求格式问题

常见信号：

- HTTP `400`
- `bad request`
- `invalid request`
- `参数错误`

处理：

1. 确认 provider 支持 `/chat/completions`。
2. 确认它支持 `messages`。
3. 确认它支持非 streaming 请求。
4. 如果它只支持特殊字段，请先用 `POST /usage` 接入。

### 连接成功但没有 usage

表现：

- 测试请求成功。
- 有上游回复内容。
- 宠物没有按真实成本动。
- 后台提示没有收到 usage。

处理：

1. 检查 provider 是否在非流式响应里返回 usage。
2. 如果正在使用 streaming，先用非 streaming 测试。
3. 如果上游永远不返回 usage，让你的代码手动 POST /usage。

## 复制排查报告

后台 `接入` 分区的排查卡片可以复制报告。报告会包含：

- provider 类型。
- 本机 proxy 地址。
- 上游 Base URL。
- 模型 / endpoint。
- HTTP status。
- 是否收到 usage。
- 错误摘要。

报告不会包含：

- API Key。
- Authorization header。
- prompt。
- completion。
- messages。
- request body。

## 成本看起来不对

检查：

1. 价格是否按每 1M tokens 填写。
2. cached input 是否用了 cached input price。
3. reasoning tokens 是否有独立价格。
4. OpenAI-style usage 里 cached tokens 是否已经从 ordinary input 中扣除。
5. Token Shredder 是本地估算，不是 provider 官方账单。
