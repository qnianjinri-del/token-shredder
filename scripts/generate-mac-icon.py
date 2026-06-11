#!/usr/bin/env python3
from pathlib import Path
import shutil
import subprocess

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public" / "assets" / "shredder-machine-tight.png"
BUILD_DIR = ROOT / "build"
ICONSET_DIR = BUILD_DIR / "icon.iconset"
PNG_OUT = BUILD_DIR / "icon.png"
ICNS_OUT = BUILD_DIR / "icon.icns"

ICON_SIZES = [
    (16, "icon_16x16.png"),
    (32, "icon_16x16@2x.png"),
    (32, "icon_32x32.png"),
    (64, "icon_32x32@2x.png"),
    (128, "icon_128x128.png"),
    (256, "icon_128x128@2x.png"),
    (256, "icon_256x256.png"),
    (512, "icon_256x256@2x.png"),
    (512, "icon_512x512.png"),
    (1024, "icon_512x512@2x.png"),
]


def make_master_icon() -> Image.Image:
    source = Image.open(SOURCE).convert("RGBA")
    canvas = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)

    shadow = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.rounded_rectangle((168, 168, 856, 856), radius=168, fill=(0, 0, 0, 150))
    shadow = shadow.filter(ImageFilter.GaussianBlur(32))
    canvas.alpha_composite(shadow, (0, 18))

    draw.rounded_rectangle((144, 144, 880, 880), radius=176, fill=(16, 22, 38, 255))
    draw.rounded_rectangle((176, 176, 848, 848), radius=140, outline=(118, 228, 247, 255), width=28)
    draw.rounded_rectangle((210, 210, 814, 814), radius=112, outline=(58, 189, 248, 110), width=10)

    scale = min(720 / source.width, 780 / source.height)
    size = (round(source.width * scale), round(source.height * scale))
    pet = source.resize(size, Image.Resampling.NEAREST)
    x = (1024 - size[0]) // 2
    y = (1024 - size[1]) // 2 + 26
    canvas.alpha_composite(pet, (x, y))

    return canvas


def main() -> None:
    if not SOURCE.exists():
        raise SystemExit(f"Missing source asset: {SOURCE}")

    BUILD_DIR.mkdir(exist_ok=True)
    if ICONSET_DIR.exists():
        shutil.rmtree(ICONSET_DIR)
    ICONSET_DIR.mkdir()

    master = make_master_icon()
    master.save(PNG_OUT)

    for size, name in ICON_SIZES:
        master.resize((size, size), Image.Resampling.LANCZOS).save(ICONSET_DIR / name)

    subprocess.run(["iconutil", "-c", "icns", str(ICONSET_DIR), "-o", str(ICNS_OUT)], check=True)
    shutil.rmtree(ICONSET_DIR)
    print(f"Generated {ICNS_OUT}")


if __name__ == "__main__":
    main()
