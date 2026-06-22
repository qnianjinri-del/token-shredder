#!/bin/zsh
set -e

DIR="${0:A:h}"
APP="$DIR/release/mac-arm64/Token Shredder.app"
BIN="$APP/Contents/MacOS/Token Shredder"

echo "Token Shredder"
echo "不需要 API Key 也可以试皮肤。"
echo "打开后：右键桌面宠物 -> 进入后台 -> 开始/宠物 -> 更换皮肤。"
echo

if [[ ! -d "$APP" ]]; then
  echo "没有找到 app：$APP"
  echo "请先运行 npm run package:mac，或使用 release 里的 zip/dmg。"
  read "?按回车退出..."
  exit 1
fi

if open -n "$APP"; then
  echo "已请求 macOS 打开 Token Shredder。"
  exit 0
fi

echo "macOS open 没有成功，尝试直接启动主程序..."
"$BIN" &
echo "已启动。这个终端窗口可以关闭。"
