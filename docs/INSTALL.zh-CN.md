# 安装说明

Token Shredder 当前优先支持 macOS。Windows / Linux 仍需要社区测试。

## 方式一：下载 macOS 构建

1. 打开 [GitHub Releases](https://github.com/qnianjinri-del/token-shredder/releases/latest)。
2. 下载最新的 `.dmg`。
3. 打开 `.dmg`，把 `Token Shredder.app` 拖进 Applications。
4. 启动 App。
5. 右键桌面宠物，选择 `进入后台`。
6. 点击 `一键试玩`。

## macOS 提示无法打开怎么办

当前构建是 unsigned / 未 notarize，所以 macOS 可能提示“无法验证开发者”。

可以尝试：

1. 打开 `系统设置`。
2. 进入 `隐私与安全性`。
3. 找到 Token Shredder 的拦截提示。
4. 选择允许打开。

你也可以从源码构建，以便先检查代码。

## 方式二：从源码运行

```bash
npm install
npm run dev:desktop
```

正式本地启动：

```bash
npm run start:desktop
```

## 打包

```bash
npm run release:check
npm run dist:mac
```

产物会生成在 `release/` 目录。

## 平台状态

- macOS arm64：当前主要目标。
- macOS x64：计划补齐。
- Windows：计划 / 需要测试。
- Linux：计划 / 需要测试。

## 注意

- Token Shredder 默认监听 `127.0.0.1`。
- 默认端口是 `17391`，被占用时会尝试 `17392` 到 `17400`。
- 当前构建没有代码签名和 notarization。
