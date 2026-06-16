# 皮肤贡献指南

Token Shredder 的皮肤应该是原创、可爱、清楚，并且能表达“AI token 成本正在被消耗”。

## 基本原则

- 原创或有明确授权。
- 不使用真实公司 logo。
- 不使用官方商标图标。
- 不使用真实美元纸币图片。
- 不包含用户隐私数据。
- 不包含 API key、prompt、completion。

## 视觉方向

欢迎这些方向：

- 碎纸机
- 小怪兽
- 黑洞
- 小火炉
- 警报灯
- 账单机器
- 像素风机器人

不建议：

- 真实 provider logo。
- 真实品牌 mascot。
- 难以辨认的抽象图。
- 过度复杂导致缩小后看不清的图。

## 当前资源结构

皮肤资源位于：

```txt
public/assets/skins/
```

常见结构：

```txt
public/assets/skins/example-frames/0.png
public/assets/skins/example-frames/1.png
public/assets/skins/example-frames/2.png
public/assets/skins/example-frames/3.png
public/assets/skins/example-frames/4.png
public/assets/skins/example-frames/5.png
public/assets/skins/example-spritesheet.png
```

## 接入代码位置

通常需要改：

- `src/types.ts`
- `src/lib/pet.ts`
- `src/components/PetSkinPanel.tsx`
- `src/components/MoneyShredder.tsx`
- `src/components/SpriteSkinPet.tsx`，如果使用通用 sprite 渲染

## PR 建议

请附：

- 皮肤名称。
- 一句话概念。
- 预览图。
- 是否原创或授权说明。
- 截图或 GIF。

如果只是提想法，可以用 GitHub Issue 模板 `Skin idea / 皮肤想法`。
