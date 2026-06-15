# Token Shredder 中文说明

Token Shredder 是一个本机运行的 AI token 成本桌面宠物。它把 Agent、脚本、SDK 或本地代理产生的 token usage 转成成本估算，然后用像素风宠物把美元碎成 TOKEN 字块。

一句话：别再假装 tokens 不花钱，让 AI 消耗在桌面上变得可见。

## 适合谁

- 经常跑 AI Agent、编程助手、自动化脚本的人。
- 想知道一次任务大概烧了多少钱的人。
- 不想把 prompt、completion 或 API key 上传到第三方服务的人。
- 想用一个有趣小工具提醒自己 token 不是免费的开发者。

## 30 秒体验

1. 下载最新 macOS 构建：[GitHub Releases](https://github.com/qnianjinri-del/token-shredder/releases/latest)。
2. 打开 `Token Shredder.app`。
3. 右键桌面宠物，选择 `进入后台`。
4. 在 `30 秒验证` 面板点击 `一键试玩`。
5. 宠物会碎一次钱，然后停在结果上。

这一步不需要 API Key，不会请求任何模型，也不代表真实账单。

## 接入真实 usage

### 方式一：直接 POST usage

如果你的脚本能拿到 token 数，直接发到本机接口：

```bash
curl -X POST http://127.0.0.1:17391/usage \
  -H "Content-Type: application/json" \
  -d '{"source":"my-agent","scenarioName":"repo cleanup","inputTokens":120000,"outputTokens":45000,"cachedInputTokens":30000,"reasoningTokens":8000}'
```

如果端口被占用，Token Shredder 会自动尝试 `17392` 到 `17400`。后台会显示实际地址。

### 方式二：运行 examples

克隆仓库后可以直接跑：

```bash
node examples/post-usage-node.mjs
python3 examples/post-usage-python.py
node examples/post-openai-style-usage.mjs
```

如果后台显示的端口不是 `17391`：

```bash
export TOKEN_SHREDDER_URL="http://127.0.0.1:17392/usage"
node examples/post-usage-node.mjs
```

### 方式三：OpenAI-compatible 本机代理

在后台填：

- API Key
- 上游 Base URL
- 模型 / 接入点 ID
- 价格

然后把你的客户端 Base URL 改成：

```txt
http://127.0.0.1:17391/v1
```

如果上游响应里带 usage，Token Shredder 会提取 usage 并驱动桌面宠物。

## 价格怎么填

价格都是可编辑示例值，不是官方实时价格。请按你实际使用的模型价格填写：

- input price / 1M tokens
- output price / 1M tokens
- cached input price / 1M tokens
- reasoning token price / 1M tokens

Token Shredder 是本地估算工具，不是 provider 官方账单。

## 隐私说明

Token Shredder 默认：

- 运行在本机。
- collector 监听 `127.0.0.1`。
- 记录 usage 数字、source、scenario、时间戳和本地成本估算。
- 不需要记录 prompt。
- 不需要记录 completion。
- 不上传 usage 数据。
- 不使用第三方 analytics。
- 不把 API key 写入 usage 日志。

## 分享

后台分享面板可以：

- 复制摘要。
- 复制英文传播帖。
- 复制中文传播帖。
- 复制分享链接。
- 导出 PNG 分享卡片。

## 当前限制

- macOS 是优先目标。
- 构建目前 unsigned / 未 notarize，macOS 可能会提示安全警告。
- Windows / Linux 还需要社区测试。
- streaming usage extraction 还不完整。
- SDK / CLI wrapper 还没正式实现。

## 欢迎贡献

我不是专业开发者，这个项目还有很多粗糙地方。欢迎帮忙：

- 录制真实 demo GIF。
- 增加原创像素宠物皮肤。
- 测试 Windows / Linux。
- 改进新手接入文档。
- 做隐私和安全 review。
- 提供真实 Agent workflow 的接入示例。

如果这个项目让你会心一笑，或者真的提醒你 tokens 在花钱，欢迎点一个 Star。
