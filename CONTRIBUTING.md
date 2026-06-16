# 参与贡献 / Contributing

谢谢你愿意看 Token Shredder。

这是一个早期开源桌面宠物项目：它已经能运行、能接 usage、能估算成本，但还有很多粗糙的地方。我不是专业开发者，所以非常欢迎小而清晰的改进。

English summary: Token Shredder is an early local-first desktop pet project. Focused bug reports, docs fixes, skin ideas, privacy review, and small pull requests are very welcome.

## 适合贡献什么

- 录制真实 macOS demo GIF。
- 改进首次启动和新手引导文案。
- 增加原创像素宠物皮肤。
- 改进本机 collector / proxy 文档。
- 测试 Windows / Linux 行为。
- 改进 unsigned macOS 安装说明。
- 增加更清楚的 provider setup 错误提示。
- 补充真实 Agent workflow 的接入示例。
- 做隐私和安全 review。

## 本地开发

```bash
npm install
npm run dev:desktop
```

常用检查：

```bash
npm test
npm run lint
npm run build
```

macOS 打包：

```bash
npm run package:mac
npm run dist:mac
```

## 隐私边界

Token Shredder 应该保持 local-first。

- 不要添加云端 analytics。
- 不要记录 prompt。
- 不要记录 completion。
- 不要记录 API key 或 Authorization header。
- collector 默认只监听 `127.0.0.1`。
- 任何未来新增的网络行为，都必须在 UI 和 README 里写清楚。

## 皮肤贡献

新皮肤欢迎，但请注意：

- 必须是原创，或你有权贡献。
- 不要使用真实公司 logo、商标 logo、官方品牌图标。
- 不要使用真实美元纸币图片。
- 请提供一个简短皮肤名。
- 请说明它如何“消耗 token 成本”。
- 如果能附预览图或 spritesheet 更好。

更多说明见：[docs/SKIN_GUIDE.md](docs/SKIN_GUIDE.md)

## Pull Request 建议

请尽量保持 PR 小而聚焦。一个清楚的小 PR，比一个混杂很多方向的大 PR 更容易 review。

建议 PR 描述：

```md
## 改了什么 / What changed

## 为什么 / Why

## 截图或 GIF / Screenshots

## 检查 / Checks
- [ ] npm test
- [ ] npm run lint
- [ ] npm run build
```

## 不太建议的贡献

- 未说明隐私边界的联网功能。
- 记录 prompt/completion/API key 的功能。
- 引入云服务或第三方 analytics。
- 大规模重构但没有明确用户收益。
- 没有授权来源的皮肤或图片素材。
