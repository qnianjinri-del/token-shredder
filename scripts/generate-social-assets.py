#!/usr/bin/env python3
from __future__ import annotations

import math
from pathlib import Path
from typing import Iterable

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "docs" / "assets" / "social"
OUT_DIR.mkdir(parents=True, exist_ok=True)


SKINS = [
    {
        "id": "shredder",
        "label": "碎钞机",
        "tag": "TOKEN BILL -> TOKEN",
        "accent": (94, 234, 212),
        "frames": [
            ROOT / "public/assets/shredder-token-frames-tight/0-idle.png",
            ROOT / "public/assets/shredder-token-frames-tight/1-feed.png",
            ROOT / "public/assets/shredder-token-frames-tight/3-shred-50.png",
            ROOT / "public/assets/shredder-token-frames-tight/5-shred-full.png",
            ROOT / "public/assets/shredder-token-frames-tight/6-burst.png",
        ],
    },
    {
        "id": "doh-dad",
        "label": "刀～爸爸",
        "tag": "burning budget",
        "accent": (251, 191, 36),
        "frames": [ROOT / f"public/assets/skins/doh-dad-burn-frames/{index}.png" for index in range(6)],
    },
    {
        "id": "codex-chomp",
        "label": "Codex 吞钞",
        "tag": "agent chomp",
        "accent": (129, 140, 248),
        "frames": [ROOT / f"public/assets/skins/codex-chomp-frames/{index}.png" for index in range(6)],
    },
    {
        "id": "agent-bot",
        "label": "Agent 小机器人",
        "tag": "cute but costly",
        "accent": (52, 211, 153),
        "frames": [ROOT / f"public/assets/skins/agent-bot-frames/{index}.png" for index in range(6)],
    },
    {
        "id": "token-furnace",
        "label": "Token 小火炉",
        "tag": "tokens go brrr",
        "accent": (251, 113, 133),
        "frames": [ROOT / f"public/assets/skins/token-furnace-frames/{index}.png" for index in range(6)],
    },
    {
        "id": "budget-black-hole",
        "label": "预算黑洞",
        "tag": "money disappears",
        "accent": (167, 139, 250),
        "frames": [ROOT / f"public/assets/skins/budget-black-hole-frames/{index}.png" for index in range(6)],
    },
]


COLORS = {
    "bg_top": (6, 10, 24),
    "bg_bottom": (13, 20, 38),
    "ink": (248, 250, 252),
    "muted": (203, 213, 225),
    "panel": (15, 23, 42),
    "panel_2": (23, 32, 54),
    "line": (76, 94, 128),
    "lime": (190, 242, 100),
    "cyan": (94, 234, 212),
    "amber": (251, 191, 36),
    "dark": (2, 6, 23),
}


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    candidates = [
        "/System/Library/Fonts/PingFang.ttc",
        "/System/Library/Fonts/Hiragino Sans GB.ttc",
        "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/Library/Fonts/Arial Unicode.ttf",
    ]
    for candidate in candidates:
        if candidate and Path(candidate).exists():
            try:
                return ImageFont.truetype(candidate, size=size)
            except OSError:
                continue
    return ImageFont.load_default()


FONTS = {
    "hero": font(82, True),
    "hero_small": font(58, True),
    "h1": font(54, True),
    "h2": font(38, True),
    "h3": font(30, True),
    "body": font(28),
    "body_bold": font(28, True),
    "small": font(22),
    "small_bold": font(22, True),
    "tiny": font(18),
}


def text_size(draw: ImageDraw.ImageDraw, text: str, selected_font: ImageFont.ImageFont) -> tuple[int, int]:
    box = draw.textbbox((0, 0), text, font=selected_font)
    return box[2] - box[0], box[3] - box[1]


def draw_wrapped(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    text: str,
    selected_font: ImageFont.ImageFont,
    fill: tuple[int, int, int],
    max_width: int,
    line_gap: int = 10,
) -> int:
    x, y = xy
    lines: list[str] = []
    current = ""

    for char in text:
        candidate = current + char
        if text_size(draw, candidate, selected_font)[0] <= max_width or not current:
            current = candidate
        else:
            lines.append(current)
            current = char
    if current:
        lines.append(current)

    for line in lines:
        draw.text((x, y), line, font=selected_font, fill=fill)
        y += text_size(draw, line, selected_font)[1] + line_gap
    return y


def rounded(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], fill, outline=None, width: int = 1, radius: int = 28):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def background(width: int, height: int) -> Image.Image:
    image = Image.new("RGB", (width, height), COLORS["bg_top"])
    pixels = image.load()
    for y in range(height):
        t = y / max(height - 1, 1)
        wave = math.sin(t * math.pi * 2) * 0.03
        for x in range(width):
            px = x / max(width - 1, 1)
            mix = min(1, max(0, t + px * 0.08 + wave))
            pixels[x, y] = tuple(
                int(COLORS["bg_top"][i] * (1 - mix) + COLORS["bg_bottom"][i] * mix)
                for i in range(3)
            )
    draw = ImageDraw.Draw(image, "RGBA")
    for x in range(0, width, 48):
        draw.line((x, 0, x, height), fill=(148, 163, 184, 22), width=1)
    for y in range(0, height, 48):
        draw.line((0, y, width, y), fill=(148, 163, 184, 20), width=1)
    for x in range(-height, width, 96):
        draw.line((x, height, x + height, 0), fill=(94, 234, 212, 14), width=2)
    return image.convert("RGBA")


def load_asset(path: Path) -> Image.Image:
    image = Image.open(path).convert("RGBA")
    bbox = image.getbbox()
    if bbox:
        image = image.crop(bbox)
    return image


def paste_asset(
    base: Image.Image,
    asset: Image.Image,
    box: tuple[int, int, int, int],
    *,
    shadow: bool = True,
) -> None:
    x1, y1, x2, y2 = box
    max_w = x2 - x1
    max_h = y2 - y1
    scale = min(max_w / asset.width, max_h / asset.height)
    new_size = (max(1, int(asset.width * scale)), max(1, int(asset.height * scale)))
    resized = asset.resize(new_size, Image.Resampling.NEAREST)
    x = x1 + (max_w - new_size[0]) // 2
    y = y1 + (max_h - new_size[1]) // 2

    if shadow:
        alpha = resized.split()[-1]
        shadow_img = Image.new("RGBA", resized.size, (0, 0, 0, 150))
        shadow_img.putalpha(alpha.filter(ImageFilter.GaussianBlur(10)))
        base.alpha_composite(shadow_img, (x + 10, y + 18))

    base.alpha_composite(resized, (x, y))


def skin_frame(skin: dict, index: int = 3) -> Image.Image:
    frames = skin["frames"]
    return load_asset(frames[min(index, len(frames) - 1)])


def draw_pill(draw: ImageDraw.ImageDraw, x: int, y: int, text: str, fill: tuple[int, int, int], text_fill=None):
    selected_font = FONTS["small_bold"]
    w, h = text_size(draw, text, selected_font)
    text_fill = text_fill or COLORS["dark"]
    rounded(draw, (x, y, x + w + 34, y + 44), fill=fill, outline=(15, 23, 42), width=3, radius=22)
    draw.text((x + 17, y + 10), text, font=selected_font, fill=text_fill)


def title_block(
    draw: ImageDraw.ImageDraw,
    x: int,
    y: int,
    title: str,
    subtitle: str,
    *,
    max_width: int,
    hero_font=None,
) -> int:
    hero_font = hero_font or FONTS["hero"]
    draw.text((x, y), title, font=hero_font, fill=COLORS["ink"])
    y += text_size(draw, title, hero_font)[1] + 18
    return draw_wrapped(draw, (x, y), subtitle, FONTS["body_bold"], COLORS["muted"], max_width, 12)


def draw_skin_card(
    base: Image.Image,
    box: tuple[int, int, int, int],
    skin: dict,
    frame_index: int = 3,
    *,
    compact: bool = False,
) -> None:
    draw = ImageDraw.Draw(base, "RGBA")
    x1, y1, x2, y2 = box
    accent = skin["accent"]
    rounded(draw, box, fill=(*COLORS["panel"], 222), outline=(*accent, 190), width=4, radius=28)
    rounded(draw, (x1 + 16, y1 + 16, x2 - 16, y2 - 96), fill=(2, 6, 23, 200), outline=(148, 163, 184, 55), width=2, radius=22)
    paste_asset(base, skin_frame(skin, frame_index), (x1 + 28, y1 + 28, x2 - 28, y2 - 110))
    label_font = FONTS["small_bold"] if compact else FONTS["h3"]
    tag_font = FONTS["tiny"] if compact else FONTS["small_bold"]
    draw.text((x1 + 24, y2 - 72), skin["label"], font=label_font, fill=COLORS["ink"])
    draw.text((x1 + 24, y2 - 42), skin["tag"], font=tag_font, fill=accent)


def all_skins_vertical() -> Path:
    image = background(1080, 1920)
    draw = ImageDraw.Draw(image, "RGBA")
    y = title_block(
        draw,
        64,
        78,
        "AI token 碎钞机",
        "桌面只留一个像素宠物，Agent 花 token 就碎钞成 TOKEN 字块",
        max_width=920,
    )
    draw_pill(draw, 64, y + 20, "本机运行", COLORS["cyan"])
    draw_pill(draw, 234, y + 20, "不记录 prompt", COLORS["lime"])
    draw_pill(draw, 474, y + 20, "6 个皮肤", COLORS["amber"])

    card_w = 446
    card_h = 326
    start_x = 64
    start_y = 430
    gap_x = 60
    gap_y = 36
    for index, skin in enumerate(SKINS):
        col = index % 2
        row = index // 2
        x = start_x + col * (card_w + gap_x)
        y_card = start_y + row * (card_h + gap_y)
        draw_skin_card(image, (x, y_card, x + card_w, y_card + card_h), skin)

    footer_y = 1560
    rounded(draw, (64, footer_y, 1016, 1810), fill=(2, 6, 23, 210), outline=(94, 234, 212, 160), width=4, radius=32)
    draw.text((96, footer_y + 42), "新人打开后怎么用？", font=FONTS["h2"], fill=COLORS["ink"])
    steps = [
        ("1", "一键试玩", "不需要 API Key"),
        ("2", "填 API Key", "走本机代理"),
        ("3", "POST /usage", "脚本直接上报"),
    ]
    for index, (num, label, detail) in enumerate(steps):
        x = 98 + index * 300
        rounded(draw, (x, footer_y + 104, x + 252, footer_y + 184), fill=(15, 23, 42, 255), outline=(148, 163, 184, 80), width=2, radius=18)
        draw.ellipse((x + 18, footer_y + 126, x + 54, footer_y + 162), fill=COLORS["lime"])
        draw.text((x + 30, footer_y + 130), num, font=FONTS["small_bold"], fill=COLORS["dark"])
        draw.text((x + 68, footer_y + 119), label, font=FONTS["small_bold"], fill=COLORS["ink"])
        draw.text((x + 68, footer_y + 148), detail, font=FONTS["tiny"], fill=COLORS["muted"])
    draw.text((96, footer_y + 210), "GitHub: qnianjinri-del/token-shredder", font=FONTS["small_bold"], fill=COLORS["cyan"])

    path = OUT_DIR / "douyin-all-skins-poster.png"
    image.convert("RGB").save(path, quality=95)
    return path


def hook_square() -> Path:
    image = background(1080, 1080)
    draw = ImageDraw.Draw(image, "RGBA")
    title_block(
        draw,
        64,
        64,
        "别再假装\nTOKEN 不花钱",
        "本机运行的桌面宠物：AI 花 token，它就碎钞。",
        max_width=480,
        hero_font=FONTS["hero_small"],
    )
    rounded(draw, (590, 132, 1000, 590), fill=(15, 23, 42, 210), outline=(94, 234, 212, 180), width=5, radius=34)
    paste_asset(image, skin_frame(SKINS[0], 4), (640, 170, 950, 520))
    rounded(draw, (72, 620, 1008, 846), fill=(2, 6, 23, 218), outline=(190, 242, 100, 150), width=4, radius=30)
    bullets = [
        ("POST /usage", "把 token 数字发到本机"),
        ("Local-first", "默认不上传、不记录 prompt"),
        ("Pixel pets", "6 个皮肤，桌面只显示宠物"),
    ]
    for i, (label, detail) in enumerate(bullets):
        y = 656 + i * 58
        draw.text((108, y), label, font=FONTS["h3"], fill=COLORS["cyan" if i == 0 else "ink"])
        draw.text((360, y + 4), detail, font=FONTS["small"], fill=COLORS["muted"])
    draw.text((74, 930), "Token Shredder", font=FONTS["h2"], fill=COLORS["ink"])
    draw.text((74, 982), "GitHub: qnianjinri-del/token-shredder", font=FONTS["small_bold"], fill=COLORS["lime"])

    path = OUT_DIR / "square-hook-token-cost.png"
    image.convert("RGB").save(path, quality=95)
    return path


def how_it_works_vertical() -> Path:
    image = background(1080, 1920)
    draw = ImageDraw.Draw(image, "RGBA")
    title_block(
        draw,
        64,
        82,
        "第一次打开\n就知道点哪里",
        "新手向导分成四条路：试玩、API Key、本机 usage、监控",
        max_width=900,
        hero_font=FONTS["hero_small"],
    )
    steps = [
        ("01", "右键宠物，进入后台", "桌面只保留小宠物，设置都在后台。", SKINS[3]),
        ("02", "选择新手向导路径", "不懂技术也能先点一键试玩。", SKINS[0]),
        ("03", "接入真实 usage", "POST token 数字，或把 baseURL 改成本机代理。", SKINS[2]),
        ("04", "宠物按真实费用停住", "没有新 usage 时不继续假装碎钱。", SKINS[5]),
    ]
    start_y = 430
    for index, (num, title, body, skin) in enumerate(steps):
        y = start_y + index * 330
        rounded(draw, (64, y, 1016, y + 270), fill=(*COLORS["panel"], 224), outline=(*skin["accent"], 178), width=4, radius=32)
        draw.text((96, y + 42), num, font=FONTS["h1"], fill=skin["accent"])
        draw.text((214, y + 50), title, font=FONTS["h2"], fill=COLORS["ink"])
        draw_wrapped(draw, (216, y + 104), body, FONTS["body_bold"], COLORS["muted"], 474, 8)
        paste_asset(image, skin_frame(skin, 3), (720, y + 24, 974, y + 244))
    draw.text((64, 1798), "Token Shredder · 本机运行 · 不记录 prompt/completion", font=FONTS["small_bold"], fill=COLORS["cyan"])

    path = OUT_DIR / "douyin-how-it-works.png"
    image.convert("RGB").save(path, quality=95)
    return path


def wide_showcase() -> Path:
    image = background(1600, 900)
    draw = ImageDraw.Draw(image, "RGBA")
    title_block(
        draw,
        70,
        66,
        "A tiny desktop pet for AI token spend",
        "本机运行，不上传 prompt。把 usage 发到 localhost，看美元碎成 TOKEN。",
        max_width=1000,
        hero_font=FONTS["h1"],
    )
    card_w = 230
    card_h = 294
    y = 330
    for index, skin in enumerate(SKINS):
        x = 72 + index * 250
        draw_skin_card(image, (x, y, x + card_w, y + card_h), skin, compact=True)
    rounded(draw, (72, 700, 1528, 812), fill=(2, 6, 23, 218), outline=(94, 234, 212, 150), width=4, radius=28)
    draw.text((106, 734), "Download on GitHub Releases", font=FONTS["h2"], fill=COLORS["ink"])
    draw.text((106, 778), "github.com/qnianjinri-del/token-shredder", font=FONTS["small_bold"], fill=COLORS["lime"])
    draw.text((960, 745), "No cloud · No prompt logging · Editable pricing", font=FONTS["small_bold"], fill=COLORS["cyan"])

    path = OUT_DIR / "wide-all-skins-banner.png"
    image.convert("RGB").save(path, quality=95)
    return path


def carousel_gif() -> Path:
    frames: list[Image.Image] = []
    for skin in SKINS:
        for frame_index in [1, 2, 3, 4]:
            image = background(720, 1280)
            draw = ImageDraw.Draw(image, "RGBA")
            draw.text((48, 60), "Token Shredder", font=FONTS["h2"], fill=COLORS["ink"])
            draw.text((48, 104), "AI token 花费桌面宠物", font=FONTS["small_bold"], fill=COLORS["muted"])
            rounded(draw, (54, 170, 666, 830), fill=(*COLORS["panel"], 230), outline=(*skin["accent"], 200), width=5, radius=40)
            paste_asset(image, skin_frame(skin, frame_index), (110, 220, 610, 720))
            draw.text((76, 880), skin["label"], font=FONTS["h1"], fill=COLORS["ink"])
            draw.text((76, 942), skin["tag"], font=FONTS["body_bold"], fill=skin["accent"])
            rounded(draw, (76, 1016, 644, 1122), fill=(2, 6, 23, 220), outline=(148, 163, 184, 90), width=2, radius=24)
            draw.text((106, 1046), "usage arrives -> pet reacts", font=FONTS["small_bold"], fill=COLORS["cyan"])
            draw.text((106, 1080), "本机运行 · 不记录 prompt", font=FONTS["tiny"], fill=COLORS["muted"])
            frames.append(image.convert("P", palette=Image.Palette.ADAPTIVE, colors=128))

    path = OUT_DIR / "token-shredder-skins-carousel.gif"
    frames[0].save(
        path,
        save_all=True,
        append_images=frames[1:],
        duration=330,
        loop=0,
        optimize=True,
    )
    return path


def classic_loop_gif() -> Path:
    sequence = [
        ROOT / "public/assets/shredder-token-frames-tight/0-idle.png",
        ROOT / "public/assets/shredder-token-frames-tight/1-feed.png",
        ROOT / "public/assets/shredder-token-frames-tight/2-shred-25.png",
        ROOT / "public/assets/shredder-token-frames-tight/3-shred-50.png",
        ROOT / "public/assets/shredder-token-frames-tight/4-shred-75.png",
        ROOT / "public/assets/shredder-token-frames-tight/5-shred-full.png",
        ROOT / "public/assets/shredder-token-frames-tight/6-burst.png",
        ROOT / "public/assets/shredder-token-frames-tight/7-pile.png",
    ]
    frames: list[Image.Image] = []
    captions = [
        "等待 usage",
        "美元进来了",
        "25% shredded",
        "50% shredded",
        "75% shredded",
        "TOKEN 掉落",
        "跨过 $1",
        "停在真实进度",
    ]
    for index, frame_path in enumerate(sequence):
        image = background(720, 1280)
        draw = ImageDraw.Draw(image, "RGBA")
        draw.text((48, 56), "AI Agent 一花钱", font=FONTS["h2"], fill=COLORS["ink"])
        draw.text((48, 106), "桌面宠物就碎钞", font=FONTS["h2"], fill=COLORS["lime"])
        rounded(draw, (64, 210, 656, 832), fill=(*COLORS["panel"], 230), outline=(94, 234, 212, 200), width=5, radius=40)
        paste_asset(image, load_asset(frame_path), (150, 280, 570, 710))
        draw.text((82, 900), captions[index], font=FONTS["h1"], fill=COLORS["ink"])
        draw_wrapped(
            draw,
            (82, 970),
            "没有新 usage 时，它会停住，不会继续假装消耗。",
            FONTS["body_bold"],
            COLORS["muted"],
            560,
            10,
        )
        draw.text((82, 1188), "github.com/qnianjinri-del/token-shredder", font=FONTS["tiny"], fill=COLORS["cyan"])
        frames.append(image.convert("P", palette=Image.Palette.ADAPTIVE, colors=128))

    path = OUT_DIR / "token-shredder-classic-loop.gif"
    frames[0].save(
        path,
        save_all=True,
        append_images=frames[1:],
        duration=420,
        loop=0,
        optimize=True,
    )
    return path


def main() -> None:
    outputs = [
        all_skins_vertical(),
        hook_square(),
        how_it_works_vertical(),
        wide_showcase(),
        carousel_gif(),
        classic_loop_gif(),
    ]
    for path in outputs:
        print(f"wrote {path}")


if __name__ == "__main__":
    main()
