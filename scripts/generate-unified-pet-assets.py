#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
from statistics import median

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public/assets/skins/source/token-pet-animation-reference.png"
GENERATED_DIR = ROOT / "public/assets/generated"
SKIN_DIR = ROOT / "public/assets/skins"
FRAME_SIZE = (384, 512)

SKINS = [
    ("codex-chomp", 0, 440, 340, 330),
    ("agent-bot", 1, 452, 300, 390),
    ("token-furnace", 2, 454, 330, 390),
    ("budget-black-hole", 3, 448, 330, 390),
]


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "/System/Library/Fonts/PingFang.ttc",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
    ]
    for candidate in candidates:
        if Path(candidate).exists():
            try:
                return ImageFont.truetype(candidate, size=size)
            except OSError:
                continue
    return ImageFont.load_default()


def draw_pixel_voucher(width: int, height: int) -> Image.Image:
    image = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)

    outline = (12, 67, 35, 255)
    dark = (31, 112, 58, 255)
    mid = (84, 176, 92, 255)
    light = (184, 242, 154, 255)
    paper = (215, 255, 181, 255)
    mint = (132, 214, 118, 255)

    draw.rectangle((2, 2, width - 3, height - 3), fill=outline)
    draw.rectangle((6, 6, width - 7, height - 7), fill=paper)
    draw.rectangle((10, 10, width - 11, height - 11), outline=dark, width=3)
    draw.rectangle((15, 15, width - 16, height - 16), outline=mid, width=1)

    for x in range(22, width - 22, 10):
        draw.line((x, 18, x + 5, 18), fill=mint, width=1)
        draw.line((x, height - 19, x + 5, height - 19), fill=mint, width=1)

    corner_size = 22
    for x, y in [(10, 10), (width - 10 - corner_size, 10), (10, height - 10 - corner_size), (width - 10 - corner_size, height - 10 - corner_size)]:
        draw.rectangle((x, y, x + corner_size, y + corner_size), fill=light, outline=dark, width=2)
        draw.text((x + 5, y + 4), "$1", font=font(9, True), fill=dark)

    cx, cy = width // 2, height // 2
    draw.ellipse((cx - 25, cy - 25, cx + 25, cy + 25), fill=(176, 236, 142, 255), outline=dark, width=3)
    draw.ellipse((cx - 16, cy - 16, cx + 16, cy + 16), outline=mid, width=2)
    draw.text((cx - 9, cy - 15), "$", font=font(28, True), fill=dark)

    draw.text((42, 14), "TOKEN", font=font(14, True), fill=dark)
    draw.text((width - 72, height - 31), "BILL", font=font(14, True), fill=dark)
    draw.text((42, height - 31), "LOCAL", font=font(8, True), fill=mid)
    draw.text((width - 88, 20), "PLAY $", font=font(8, True), fill=mid)

    for offset in range(-34, 38, 12):
        draw.line((cx + offset, cy - 42, cx + offset + 16, cy - 32), fill=(143, 212, 116, 160), width=1)
        draw.line((cx + offset, cy + 42, cx + offset + 16, cy + 32), fill=(143, 212, 116, 160), width=1)

    return image


def draw_vertical_voucher(width: int, height: int) -> Image.Image:
    image = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)

    outline = (12, 67, 35, 255)
    dark = (31, 112, 58, 255)
    mid = (84, 176, 92, 255)
    light = (184, 242, 154, 255)
    paper = (215, 255, 181, 255)
    mint = (132, 214, 118, 255)

    draw.rectangle((2, 2, width - 3, height - 3), fill=outline)
    draw.rectangle((6, 6, width - 7, height - 7), fill=paper)
    draw.rectangle((10, 10, width - 11, height - 11), outline=dark, width=3)
    draw.rectangle((15, 15, width - 16, height - 16), outline=mid, width=1)

    for y in range(26, height - 26, 12):
        draw.line((18, y, 18, y + 5), fill=mint, width=1)
        draw.line((width - 19, y, width - 19, y + 5), fill=mint, width=1)

    for x, y in [(10, 10), (width - 32, 10), (10, height - 32), (width - 32, height - 32)]:
        draw.rectangle((x, y, x + 22, y + 22), fill=light, outline=dark, width=2)
        draw.text((x + 5, y + 4), "$1", font=font(9, True), fill=dark)

    cx, cy = width // 2, height // 2
    draw.ellipse((cx - 21, cy - 21, cx + 21, cy + 21), fill=(176, 236, 142, 255), outline=dark, width=3)
    draw.text((cx - 8, cy - 13), "$", font=font(24, True), fill=dark)

    for index, letter in enumerate("TOKEN"):
        draw.text((cx - 8, 42 + index * 14), letter, font=font(13, True), fill=dark)
    draw.text((cx - 14, height - 60), "BILL", font=font(10, True), fill=mid)
    draw.text((cx - 16, height - 46), "LOCAL", font=font(8, True), fill=mid)

    return image


def generate_token_vouchers() -> None:
    GENERATED_DIR.mkdir(parents=True, exist_ok=True)
    horizontal = draw_pixel_voucher(176, 80)
    vertical = draw_vertical_voucher(80, 176)
    horizontal.save(GENERATED_DIR / "token-bill-pixel.png")
    vertical.save(GENERATED_DIR / "token-bill-vertical.png")
    print(f"wrote {GENERATED_DIR / 'token-bill-pixel.png'}")
    print(f"wrote {GENERATED_DIR / 'token-bill-vertical.png'}")


def estimate_bg(cell: Image.Image) -> tuple[int, int, int]:
    rgb = cell.convert("RGB")
    samples: list[tuple[int, int, int]] = []
    w, h = rgb.size
    for x, y in [
        (0, 0),
        (w - 1, 0),
        (0, h - 1),
        (w - 1, h - 1),
        (w // 2, 0),
        (w // 2, h - 1),
        (0, h // 2),
        (w - 1, h // 2),
    ]:
        samples.append(rgb.getpixel((x, y)))
    return tuple(int(median(channel)) for channel in zip(*samples))


def remove_small_components(mask: Image.Image, min_area: int) -> Image.Image:
    width, height = mask.size
    source = mask.load()
    visited = set()
    keep = Image.new("L", mask.size, 0)
    keep_pixels = keep.load()

    for y in range(height):
        for x in range(width):
            if source[x, y] == 0 or (x, y) in visited:
                continue

            stack = [(x, y)]
            component: list[tuple[int, int]] = []
            visited.add((x, y))

            while stack:
                px, py = stack.pop()
                component.append((px, py))
                for nx, ny in ((px + 1, py), (px - 1, py), (px, py + 1), (px, py - 1)):
                    if nx < 0 or ny < 0 or nx >= width or ny >= height:
                        continue
                    if source[nx, ny] == 0 or (nx, ny) in visited:
                        continue
                    visited.add((nx, ny))
                    stack.append((nx, ny))

            if len(component) >= min_area:
                for px, py in component:
                    keep_pixels[px, py] = 255

    return keep


def make_sprite_mask(cell: Image.Image, *, burst: bool) -> Image.Image:
    bg = estimate_bg(cell)
    rgb = cell.convert("RGB")
    mask = Image.new("L", cell.size, 0)
    mask_pixels = mask.load()
    pixels = rgb.load()

    for y in range(cell.height):
        for x in range(cell.width):
            r, g, b = pixels[x, y]
            brightness = max(r, g, b)
            saturation = brightness - min(r, g, b)
            distance = abs(r - bg[0]) + abs(g - bg[1]) + abs(b - bg[2])
            if brightness > 42 or saturation > 20 or distance > 42:
                mask_pixels[x, y] = 255

    mask = remove_small_components(mask, 18 if burst else 120)
    mask = mask.filter(ImageFilter.MaxFilter(7))
    mask = mask.filter(ImageFilter.MinFilter(3))
    return mask


def extract_frame(sheet: Image.Image, row: int, column: int, bottom: int, max_width: int, max_height: int) -> Image.Image:
    cell_width = sheet.width // 6
    cell_height = sheet.height // 4
    cell = sheet.crop((column * cell_width, row * cell_height, (column + 1) * cell_width, (row + 1) * cell_height)).convert("RGBA")
    mask = make_sprite_mask(cell, burst=column == 5)
    bbox = mask.getbbox()

    if not bbox:
        return Image.new("RGBA", FRAME_SIZE, (0, 0, 0, 0))

    pad = 8
    left = max(0, bbox[0] - pad)
    top = max(0, bbox[1] - pad)
    right = min(cell.width, bbox[2] + pad)
    lower = min(cell.height, bbox[3] + pad)

    cropped = cell.crop((left, top, right, lower))
    cropped_mask = mask.crop((left, top, right, lower))
    cropped.putalpha(cropped_mask)

    scale = min(max_width / cropped.width, max_height / cropped.height)
    new_size = (max(1, int(cropped.width * scale)), max(1, int(cropped.height * scale)))
    resized = cropped.resize(new_size, Image.Resampling.NEAREST)

    out = Image.new("RGBA", FRAME_SIZE, (0, 0, 0, 0))
    x = (FRAME_SIZE[0] - new_size[0]) // 2
    y = max(0, bottom - new_size[1])
    out.alpha_composite(resized, (x, y))
    return out


def make_spritesheet(frames: list[Image.Image]) -> Image.Image:
    sheet = Image.new("RGBA", (FRAME_SIZE[0] * len(frames), FRAME_SIZE[1]), (0, 0, 0, 0))
    for index, frame in enumerate(frames):
        sheet.alpha_composite(frame, (index * FRAME_SIZE[0], 0))
    return sheet


def generate_skin_frames() -> None:
    sheet = Image.open(SOURCE).convert("RGBA")
    for skin_id, row, bottom, max_width, max_height in SKINS:
        frame_dir = SKIN_DIR / f"{skin_id}-frames"
        frame_dir.mkdir(parents=True, exist_ok=True)
        frames = [
            extract_frame(sheet, row, column, bottom, max_width, max_height)
            for column in range(6)
        ]
        for index, frame in enumerate(frames):
            path = frame_dir / f"{index}.png"
            frame.save(path)
            print(f"wrote {path}")

        spritesheet = make_spritesheet(frames)
        sheet_path = SKIN_DIR / f"{skin_id}-spritesheet.png"
        spritesheet.save(sheet_path)
        print(f"wrote {sheet_path}")


def main() -> None:
    generate_token_vouchers()
    generate_skin_frames()


if __name__ == "__main__":
    main()
