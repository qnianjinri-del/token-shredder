# 安全说明

Token Shredder 是一个本机桌面应用，不是财务级 billing 系统。

## 支持范围

当前重点保护：

- 不把 usage 上传到云端。
- 不记录 prompt / completion。
- 不记录 API key / Authorization header。
- collector 默认只监听 `127.0.0.1`。
- 本机代理默认只用于用户明确配置的 provider。

## 不支持的承诺

当前版本不承诺：

- 财务级账单准确性。
- provider 官方价格实时同步。
- 企业级审计日志。
- 多用户权限控制。
- 系统级 secret storage。
- 已签名和 notarized 的 macOS 分发。

## 反馈安全问题

如果你发现安全问题：

1. 请尽量不要公开粘贴 API key、prompt、completion 或私密日志。
2. 可以先开一个不含敏感信息的 issue，说明风险类型。
3. 如果需要，我会再补更合适的私下联络方式。

## 给贡献者的安全边界

请不要提交会做这些事的改动：

- 默认上传 usage 到第三方服务。
- 默认记录 prompt 或 completion。
- 默认记录 API key 或 Authorization header。
- 默认监听公网地址。
- 隐式启用代理转发。
- 在日志、分享卡片、错误提示里暴露密钥。
