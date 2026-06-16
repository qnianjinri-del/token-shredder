# 隐私说明

Token Shredder 的默认原则是 local-first。

## 默认记录什么

Token Shredder 默认只需要 usage 数字：

- input tokens
- output tokens
- cached input tokens
- reasoning tokens
- direct cost
- source
- scenarioName
- timestamp
- 本地成本估算

## 默认不记录什么

Token Shredder 默认不需要记录：

- prompt
- completion
- messages
- API key
- Authorization header
- provider 原始请求正文
- provider 原始响应正文

## 数据会上传吗

不会。当前版本没有云端后端，也没有第三方 analytics。

本机 collector 默认监听：

```txt
127.0.0.1
```

## API Key

如果你使用 OpenAI-compatible 本机代理，后台会让你填写 provider API Key。

当前原则：

- API Key 用于本机转发请求。
- API Key 不应该写入 usage 日志。
- API Key 不应该出现在分享文本里。
- 默认不需要为了 POST /usage 填写 API Key。

后续如果实现系统 Keychain / Keychain Access，会在 UI 和 README 中明确说明。

## Codex 本地监控

如果启用 Codex 本地监控，Token Shredder 只读取本机 `~/.codex/sessions` 里新产生的 `token_count` 事件。

它不应该读取 prompt 或 completion 内容。

## 分享功能

分享面板会生成：

- 成本摘要
- 中英文传播帖
- 分享链接
- PNG 分享卡片

这些内容只应该包含成本估算和 token usage 摘要，不应该包含 prompt、completion 或 API key。

## 如果你发现隐私问题

请开 issue，或在 GitHub Discussion 里说明。请不要在公开 issue 里粘贴 API key、prompt、completion 或私密日志。
