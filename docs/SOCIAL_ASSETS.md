# Token Shredder Social Assets

这些素材由项目内真实像素皮肤生成，适合发抖音、小红书、即刻、X / Twitter、V2EX、GitHub README 或 Release 贴文。

重新生成：

```bash
npm run assets:social
```

## 竖版封面

文件：

- `docs/assets/social/douyin-all-skins-poster.png`

适合：

- 抖音封面
- 小红书首图
- 即刻配图
- 朋友圈 / 社群首图

建议配文：

```txt
我做了一个 AI token 碎钞机桌面宠物。

你的 Agent 花 token，它就在桌面把美元碎成 TOKEN 字块。
本机运行，不上传数据，不记录 prompt。

项目还很早期，我也不是专业开发者，欢迎大家提 issue / PR 一起优化。

GitHub: qnianjinri-del/token-shredder
```

## 使用流程竖图

文件：

- `docs/assets/social/douyin-how-it-works.png`

适合：

- 抖音第二张图
- 小红书教程图
- GitHub Discussion / issue 里的新手解释

建议配文：

```txt
第一次打开不知道怎么用也没关系。

后台现在有新手向导：
1. 一键试玩
2. 填 API Key 走本机代理
3. POST /usage 上报 token 数
4. 看本机 Codex token_count 监控
```

## 方形钩子图

文件：

- `docs/assets/social/square-hook-token-cost.png`

适合：

- X / Twitter
- 即刻
- GitHub Release 第一张图
- 文章头图

建议配文：

```txt
Stop pretending tokens are free.

Token Shredder 是一个本机运行的 AI token 成本桌面宠物。
把 usage 发到 localhost，它就会按成本碎钞。
```

## 横幅图

文件：

- `docs/assets/social/wide-all-skins-banner.png`

适合：

- GitHub README
- Release notes
- HN / Twitter 横图
- 项目介绍页

## 动图

文件：

- `docs/assets/social/token-shredder-skins-carousel.gif`
- `docs/assets/social/token-shredder-classic-loop.gif`

适合：

- 抖音 / 小红书可以作为视频素材导入剪辑工具
- GitHub README 或 Release notes
- X / Twitter 动图

建议顺序：

1. 先发 `token-shredder-skins-carousel.gif` 展示所有皮肤。
2. 再发 `token-shredder-classic-loop.gif` 解释“真实 usage 来了才碎钱”。

## 发布标题备选

- 我做了一个 AI token 碎钞机桌面宠物
- 别再假装 tokens 不花钱了
- 你的 AI Agent 花 token，它就在桌面碎钞
- 一个本机运行、不记录 prompt 的 AI token 成本宠物

## 注意

- 不要说它是官方账单工具。
- 不要说价格自动实时更新。
- 建议强调 local-first、no prompt logging、editable pricing。
- 如果发中文社区，谦逊地说“还很早期，欢迎一起优化”会比过度营销更可信。
