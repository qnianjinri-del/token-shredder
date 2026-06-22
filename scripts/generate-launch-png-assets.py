#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "docs" / "assets"

spec = importlib.util.spec_from_file_location("social_assets", ROOT / "scripts" / "generate-social-assets.py")
social = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(social)


def asset(relative_path: str) -> Image.Image:
    return social.load_asset(ROOT / relative_path)


def save_rgb(image: Image.Image, name: str, *, jpg: bool = False) -> None:
    path = OUT_DIR / name
    image.convert("RGB").save(path, quality=95)
    print(f"wrote {path}")
    if jpg:
        jpg_path = path.with_suffix(".jpg")
        image.convert("RGB").save(jpg_path, quality=92)
        print(f"wrote {jpg_path}")


def social_preview() -> None:
    image = social.background(1280, 640)
    draw = ImageDraw.Draw(image, "RGBA")

    social.draw_pill(draw, 68, 54, "macOS v0.1 · local-first", social.COLORS["lime"])
    draw.text((68, 116), "Token Shredder", font=social.FONTS["hero_small"], fill=social.COLORS["ink"])
    draw.text((72, 204), "一个本机运行的 AI token 成本桌面宠物", font=social.FONTS["h3"], fill=social.COLORS["muted"])
    draw.text((72, 250), "A tiny desktop pet that shreds AI token spend in real time.", font=social.FONTS["small_bold"], fill=social.COLORS["muted"])
    social.rounded(draw, (72, 326, 546, 400), fill=social.COLORS["cyan"], outline=None, radius=16)
    draw.text((100, 354), "POST /usage -> TOKEN chunks", font=social.FONTS["small_bold"], fill=social.COLORS["dark"])
    social.draw_pill(draw, 72, 424, "No cloud", social.COLORS["cyan"])
    social.draw_pill(draw, 250, 424, "No prompt logging", social.COLORS["lime"])
    social.draw_pill(draw, 520, 424, "Editable pricing", social.COLORS["amber"])

    social.rounded(draw, (760, 72, 1170, 542), fill=(15, 23, 42, 224), outline=(94, 234, 212, 128), width=3, radius=28)
    social.paste_asset(image, asset("public/assets/shredder-frames-tight/1-feed.png"), (815, 94, 1116, 368))
    social.rounded(draw, (802, 412, 1128, 486), fill=(2, 6, 23, 232), outline=(94, 234, 212, 90), width=2, radius=14)
    draw.text((830, 430), "$3.42 shredded", font=social.FONTS["h3"], fill=social.COLORS["ink"])
    draw.text((830, 464), "3 bills · next bill 42%", font=social.FONTS["tiny"], fill=social.COLORS["muted"])

    save_rgb(image, "token-shredder-social-preview.png", jpg=True)


def getting_started() -> None:
    image = social.background(1600, 900)
    draw = ImageDraw.Draw(image, "RGBA")
    draw.text((80, 78), "First real usage in 3 paths", font=social.FONTS["hero_small"], fill=social.COLORS["ink"])
    draw.text((84, 150), "打开后台，从“开始”分区选择最短路径。失败时复制排查报告。", font=social.FONTS["small_bold"], fill=social.COLORS["muted"])

    cards = [
        ("1", "No-key demo", "先看宠物动一次，不请求模型。", "public/assets/shredder-frames-tight/1-feed.png", "Click 一键试玩"),
        ("2", "Copy to Codex", "把接入提示词发给 coding agent。", "public/assets/shredder-frames-tight/3-shred-50.png", "Copy prompt"),
        ("3", "POST /usage", "脚本有 token 数就直接上报。", "public/assets/shredder-frames-tight/6-burst.png", "Send JSON usage"),
    ]
    for index, (num, title, body, image_path, button) in enumerate(cards):
        x = 80 + index * 500
        y = 230
        social.rounded(draw, (x, y, x + 430, y + 520), fill=(15, 23, 42, 226), outline=(94, 234, 212, 110), width=3, radius=24)
        draw.ellipse((x + 28, y + 28, x + 84, y + 84), fill=social.COLORS["lime"])
        draw.text((x + 48, y + 41), num, font=social.FONTS["h3"], fill=social.COLORS["dark"])
        draw.text((x + 98, y + 38), title, font=social.FONTS["h3"], fill=social.COLORS["ink"])
        draw.text((x + 42, y + 104), body, font=social.FONTS["small"], fill=social.COLORS["muted"])
        social.rounded(draw, (x + 48, y + 160, x + 382, y + 420), fill=(2, 6, 23, 220), outline=(94, 234, 212, 70), width=2, radius=18)
        social.paste_asset(image, asset(image_path), (x + 104, y + 176, x + 326, y + 406))
        social.rounded(draw, (x + 48, y + 450, x + 382, y + 492), fill=social.COLORS["cyan" if index == 1 else "lime"], outline=None, radius=10)
        draw.text((x + 70, y + 460), button, font=social.FONTS["small_bold"], fill=social.COLORS["dark"])

    save_rgb(image, "token-shredder-getting-started.png")


def troubleshooting() -> None:
    image = social.background(1600, 900)
    draw = ImageDraw.Draw(image, "RGBA")
    draw.text((78, 78), "When setup fails, show the next move", font=social.FONTS["hero_small"], fill=social.COLORS["ink"])
    draw.text((82, 150), "Provider 测试失败后，不再只给一句“连接失败”。", font=social.FONTS["small_bold"], fill=social.COLORS["muted"])

    social.rounded(draw, (80, 220, 800, 780), fill=(15, 23, 42, 226), outline=(94, 234, 212, 108), width=3, radius=26)
    draw.text((122, 264), "Provider troubleshooting card", font=social.FONTS["h2"], fill=social.COLORS["ink"])
    rows = [
        ("API Key / 权限", "401 / 403 / Unauthorized", (251, 113, 133)),
        ("模型或 endpoint", "404 / model not found", (251, 191, 36)),
        ("限流或额度", "429 / quota / rate limit", (253, 224, 71)),
        ("连接成功但无 usage", "switch to POST /usage if needed", (94, 234, 212)),
    ]
    for index, (title, detail, color) in enumerate(rows):
        y = 326 + index * 94
        social.rounded(draw, (124, y, 744, y + 68), fill=(2, 6, 23, 220), outline=(*color, 150), width=2, radius=14)
        draw.ellipse((148, y + 21, 174, y + 47), fill=color)
        draw.text((194, y + 14), title, font=social.FONTS["small_bold"], fill=social.COLORS["ink"])
        draw.text((194, y + 40), detail, font=social.FONTS["tiny"], fill=social.COLORS["muted"])
    social.rounded(draw, (124, 718, 404, 760), fill=social.COLORS["cyan"], outline=None, radius=10)
    draw.text((146, 728), "Copy no-secret report", font=social.FONTS["small_bold"], fill=social.COLORS["dark"])

    social.paste_asset(image, asset("public/assets/shredder-frames-tight/6-burst.png"), (930, 240, 1290, 640))
    draw.text((860, 695), "No prompt logging", font=social.FONTS["h2"], fill=social.COLORS["ink"])
    draw.text((860, 742), "No API keys in reports · local-first", font=social.FONTS["small_bold"], fill=social.COLORS["muted"])

    save_rgb(image, "token-shredder-troubleshooting.png")


def demo_storyboard() -> None:
    image = social.background(960, 540)
    draw = ImageDraw.Draw(image, "RGBA")
    draw.text((50, 52), "Watch tokens become visible", font=social.FONTS["h2"], fill=social.COLORS["ink"])
    draw.text((54, 104), "A local pet reacts only when usage arrives.", font=social.FONTS["tiny"], fill=social.COLORS["muted"])

    frames = [
        ("Idle", "waits quietly", "public/assets/shredder-frames-tight/0-idle.png"),
        ("Feed", "usage arrives", "public/assets/shredder-frames-tight/1-feed.png"),
        ("Shred", "cost advances", "public/assets/shredder-frames-tight/3-shred-50.png"),
        ("Burst", "TOKEN drops", "public/assets/shredder-frames-tight/6-burst.png"),
    ]
    for index, (label, body, image_path) in enumerate(frames):
        x = 54 + index * 222
        y = 150
        social.rounded(draw, (x, y, x + 178, y + 268), fill=(15, 23, 42, 210), outline=(148, 163, 184, 80), width=2, radius=20)
        social.paste_asset(image, asset(image_path), (x + 16, y + 22, x + 162, y + 188), shadow=False)
        draw.text((x + 28, y + 208), label, font=social.FONTS["small_bold"], fill=social.COLORS["ink"])
        draw.text((x + 28, y + 238), body, font=social.FONTS["tiny"], fill=social.COLORS["muted"])

    save_rgb(image, "token-shredder-demo-storyboard.png")


def skins() -> None:
    image = social.background(1600, 900)
    draw = ImageDraw.Draw(image, "RGBA")
    draw.text((78, 72), "Choose the pet that hurts best", font=social.FONTS["hero_small"], fill=social.COLORS["ink"])
    draw.text((82, 150), "原创像素皮肤，展示同一个 token 花费反馈。", font=social.FONTS["small_bold"], fill=social.COLORS["muted"])

    shown = social.SKINS[:6]
    card_w = 230
    card_h = 300
    for index, skin in enumerate(shown):
        x = 72 + index * 250
        y = 330
        social.draw_skin_card(image, (x, y, x + card_w, y + card_h), skin, compact=True)

    save_rgb(image, "token-shredder-skins.png")


def main() -> None:
    social_preview()
    getting_started()
    troubleshooting()
    demo_storyboard()
    skins()


if __name__ == "__main__":
    main()
